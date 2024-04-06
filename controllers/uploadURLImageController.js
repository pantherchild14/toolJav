const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Client } = require('basic-ftp');

async function downloadImages(imageUrls, localDirectory, ftpConfig) {
    const client = new Client();
    if (!fs.existsSync(localDirectory)) {
        fs.mkdirSync(localDirectory, { recursive: true });
    }

    await client.access(ftpConfig);

    const directoryExists = await client.list(localDirectory).catch(() => false);
    if (!directoryExists.length > 0) {
        console.log(`Folder ${localDirectory} does not exist on FTP server. Creating...`);
        await client.ensureDir(localDirectory);
        console.log(`Folder ${localDirectory} created on FTP server.`);
    }
    const downloadPromises = imageUrls.map(async (imageUrl, index) => {
        try {
            const response = await axios({
                method: 'GET',
                url: imageUrl,
                responseType: 'stream',
            });

            const parsedUrl = new URL(imageUrl);
            const filename = path.basename(parsedUrl.pathname);
            const localPath = `${localDirectory}/${filename}`;

            const writer = fs.createWriteStream(localPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(localPath));
                writer.on('error', reject);
            });
        } catch (error) {
            throw error;
        }
    });

    return Promise.all(downloadPromises);
}

async function uploadImagesToFTP(imageUrls, ftpConfig, idJav) {
    const client = new Client();
    try {
        await client.access(ftpConfig);
        const remoteDirectory = `public/images/${idJav}`;

        for (const imageUrl of imageUrls) {
            const filename = path.basename(imageUrl);
            const remotePath = `${remoteDirectory}/${filename}`;
            console.log("filename", filename);

            await client.uploadFrom(imageUrl, remotePath);
            console.log(`Uploaded ${imageUrl} to FTP server as ${remotePath}`);
            fs.unlinkSync(imageUrl);
        }
    } catch (error) {
        console.error('Error uploading images to FTP server:', error);
    } finally {
        client.close();
    }
}
async function uploadURLImageController(imageUrls, localDirectory, ftpConfig, idJav) {
    try {
        const localFiles = await downloadImages(imageUrls, localDirectory, ftpConfig);
        await uploadImagesToFTP(localFiles, ftpConfig, idJav);
    } catch (error) {
        console.error('Error downloading images or uploading to FTP server:', error);
    }
}

module.exports = uploadURLImageController;



// const localDirectory = 'public/images';

//             const ftpConfig = {
//                 host: '78.46.22.123',
//                 user: 'ftp_images_dudedata_xyz',
//                 password: 'GMPNEH6A8REijDEx',
//                 port: 22,
//             };

//             await uploadURLImageController(javList.UploadFileImage,localDirectory, ftpConfig);