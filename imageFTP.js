const Connection = require("./configs/mysqlDb");

const Redis = require("ioredis");
const redis = new Redis({
    host: "redis-17178.c1.ap-southeast-1-1.ec2.cloud.redislabs.com",
    port: 17178,
    password: "kFFIOZ912kePhOVdDNu8EjS9Dac8524F",
});
const { promisify } = require("util");
const getAsync = promisify(redis.get).bind(redis);
const setAsync = promisify(redis.set).bind(redis);
const uploadURLImageController = require("./controllers/uploadURLImageController");
const path = require("path");

async function getRandomUnprocessedID() {
    let connection = await Connection();
    try {
        const [[uuidData]] = await connection.query("SELECT ID_JAV FROM library WHERE status = 0 ORDER BY RAND() DESC LIMIT 1");

        if (!uuidData || uuidData.length === 0) {
            return null;
        }
        const uuid = uuidData.ID_JAV;
        const isProcessedKey = `processed:${uuid}`;
        const isProcessed = await getAsync(isProcessedKey);
        if (!isProcessed) {
            await setAsync(isProcessedKey, "1");
            return uuid;
        } else {
            return getRandomUnprocessedID();
        }
    } finally {
        connection.release();
    }
}

async function isDeleted() {
    let connection = await Connection();
    let uuid = await getRandomUnprocessedID();
    let dataUploadImage;
    try {
        if (!uuid) {
            console.log("Không có ID_JAV nào cần xử lý.");
            return;
        }
        const [[arrImage]] = await connection.query("SELECT PREVIEW_IMAGE FROM library WHERE ID_JAV = ?", [uuid]);
        if (!arrImage) {
            connection.release();
            return console.log("Please update arrImage");
        }
        const localDirectory = `public/images/${uuid}`;
        const ftpConfig = {
            host: '78.46.22.123',
            user: 'ftp_images_dudedata_xyz',
            password: 'GMPNEH6A8REijDEx',
            secure: false,
        };
        arrImage.PREVIEW_IMAGE = arrImage.PREVIEW_IMAGE.split(', ')

        // Tạo mảng các tên tệp từ đường dẫn hình ảnh
        const mapArrImage = arrImage.PREVIEW_IMAGE.map((img) => {
            const parsedUrl = new URL(img);
            const pathname = parsedUrl.pathname;
            const filename = path.basename(pathname);
            return filename;
        });

        dataUploadImage = mapArrImage;

        await uploadURLImageController(arrImage.PREVIEW_IMAGE, localDirectory, ftpConfig, uuid);
    } catch (err) {
        await connection.query(`UPDATE library SET status = 99 WHERE ID_JAV = ?`, [uuid]);
        connection.release();
        console.log(err);
        console.log("không thể xóa updateImage: ", uuid);
    } finally {
        try {
            await connection.query("UPDATE library SET status = 1, PREVIEW_IMAGE = ? WHERE ID_JAV = ?", [dataUploadImage ? dataUploadImage.join(', ') : '', uuid]);
            await connection.commit();
            connection.release();
            const workerInterval = 0.1 * 60 * 1000;
            setTimeout(async () => {
                await isDeleted();
            }, workerInterval);
        } catch (err) {
            console.log(err);
        }
    }
}

isDeleted();