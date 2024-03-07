const util = require('util');
const path = require('path');

const Connection = require("../configs/mysqlDb");

module.exports = {
    async javLibaryControllerDB(DATA) {
        try {
            const arrImage = DATA.UploadFileImage.join(", ");
            const splitArrImage = arrImage.split(",");
            const mapArrImage = splitArrImage.map((img) => {
                const parsedUrl = new URL(img);
                const pathname = parsedUrl.pathname;
                const filename = path.basename(pathname);
                return filename;
            });

            const dataUploadImage = await Promise.all(mapArrImage);

            const connection = await Connection();

            const checkJavIDQuery = "SELECT COUNT(*) AS count FROM library WHERE ID_JAV = ?";
            const checkJavIDParams = [DATA.ID[0]];

            const matchIdCheckResult = await new Promise((resolve, reject) => {
                connection.query(checkJavIDQuery, checkJavIDParams, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results[0].count);
                    }
                });
            });

            let updateQuery;
            let updateParams;

            if (matchIdCheckResult > 0) {
                updateQuery = `
                    UPDATE library 
                    SET 
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
                    DATA.ReleaseDate[0],
                    DATA.Length[0],
                    DATA.Director[0],
                    DATA.Maker[0],
                    DATA.Label[0],
                    DATA.Genre.join(", "),
                    DATA.Cast[0],
                    dataUploadImage.join(", "),
                    DATA.ID[0]
                ];
                console.log("Update Data");
            } else {
                updateQuery = `
                    INSERT INTO library(
                        ID_JAV, 
                        RELEASE_DATE, 
                        LENGTH, 
                        DIRECTOR, 
                        MAKER, 
                        LABEL, 
                        GENRE, 
                        CAST, 
                        PREVIEW_IMAGE
                    ) 
                    VALUES (?,?,?,?,?,?,?,?,?)
                `;

                updateParams = [
                    DATA.ID[0],
                    DATA.ReleaseDate[0],
                    DATA.Length[0],
                    DATA.Director[0],
                    DATA.Maker[0],
                    DATA.Label[0],
                    DATA.Genre.join(", "),
                    DATA.Cast[0],
                    dataUploadImage.join(", ")
                ];
                console.log("Insert Data");
            }

            const queryResult = await new Promise((resolve, reject) => {
                connection.query(updateQuery, updateParams, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            return queryResult;
        } catch (error) {
            throw error;
        }
    },
    async getJavaLibaryControllerDB(ID) {
        try {
            const connection = await Connection();
            const queryAsync = util.promisify(connection.query).bind(connection);
            const query = `SELECT * FROM library WHERE ID_JAV = ?`;

            const results = await queryAsync(query, [ID]);

            if (results.length === 0) {
                return null;
            }

            return results;

        } catch (error) {
            throw error;
        }
    }
};
