const util = require('util');
const path = require('path');

const Connection = require("../configs/mysqlDb");

module.exports = {
    async javLibaryControllerDB(DATA) {
        try {
            const arrImage = DATA.UploadFileImage.join(', ');
            const splitArrImage = arrImage.split(', ');
            const mapArrImage = splitArrImage.map((img) => {
                const parsedUrl = new URL(img);
                const pathname = parsedUrl.pathname;
                const filename = path.basename(pathname);
                return filename;
            });

            const dataUploadImage = await Promise.all(mapArrImage);

            const connection = await Connection();

            const checkJavIDQuery = 'SELECT COUNT(*) AS count FROM library WHERE ID_JAV = ?';
            const checkJavIDParams = [DATA.ID[0]];

            const [matchIdCheckResult] = await connection.query(checkJavIDQuery, checkJavIDParams);

            let updateQuery;
            let updateParams;

            if (matchIdCheckResult.count > 0) {
                updateQuery = `
                    UPDATE library 
                    SET 
                        TITLE = ?,
                        RELEASE_DATE = ?, 
                        LENGTH = ?, 
                        DIRECTOR = ?, 
                        MAKER = ?, 
                        LABEL = ?, 
                        GENRE = ?, 
                        CAST = ?, 
                        PREVIEW_IMAGE = ?
                    WHERE ID_JAV = ?
                `;

                updateParams = [
                    DATA.TITLE[0],
                    DATA.ReleaseDate[0],
                    DATA.Length[0],
                    DATA.Director[0],
                    DATA.Maker[0],
                    DATA.Label[0],
                    DATA.Genre.join(', '),
                    DATA.Cast[0],
                    dataUploadImage.join(', '),
                    DATA.ID[0],
                ];
                console.log('Update Data');
            } else {
                updateQuery = `
                    INSERT INTO library(
                        ID_JAV, 
                        TITLE,
                        RELEASE_DATE, 
                        LENGTH, 
                        DIRECTOR, 
                        MAKER, 
                        LABEL, 
                        GENRE, 
                        CAST, 
                        PREVIEW_IMAGE
                    ) 
                    VALUES (?,?,?,?,?,?,?,?,?,?)
                `;

                updateParams = [
                    DATA.ID[0],
                    DATA.TITLE[0],
                    DATA.ReleaseDate[0],
                    DATA.Length[0],
                    DATA.Director[0],
                    DATA.Maker[0],
                    DATA.Label[0],
                    DATA.Genre.join(', '),
                    DATA.Cast[0],
                    dataUploadImage.join(', '),
                ];
                console.log('Insert Data');
            }

            const [queryResult] = await connection.query(updateQuery, updateParams);

            return queryResult;
        } catch (error) {
            throw error;
        }
    },
    async getJavaLibaryControllerDB(ID) {
        try {
            const connection = await Connection();
            const query = `SELECT * FROM library WHERE ID_JAV = ?`;

            const results = await connection.query(query, [ID]);

            if (results.length === 0) {
                return null;
            }

            const formattedResults = results.map(row => ({
                ID: row[0].ID,
                TITLE: row[0].TITLE,
                ID_JAV: row[0].ID_JAV,
                RELEASE_DATE: row[0].RELEASE_DATE,
                LENGTH: row[0].LENGTH,
                DIRECTOR: row[0].DIRECTOR,
                MAKER: row[0].MAKER,
                LABEL: row[0].LABEL,
                GENRE: row[0].GENRE,
                CAST: row[0].CAST,
                PREVIEW_IMAGE: row[0].PREVIEW_IMAGE,
                UPLOAD_FILE_IMAGE: row[0].UPLOAD_FILE_IMAGE,
                CURRENT_TIME: row[0].CURRENT_TIME,
            }));

            return formattedResults[0];

        } catch (error) {
            throw error;
        }
    }
};
