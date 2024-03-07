const request = require("request");
const axios = require("axios");
const zlib = require("zlib");

module.exports = {
    async curl(url) {
        try {
            const options = {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
                    "Accept": "*/*",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Content-Type": 'text/html; charset=utf-8',
                },
            };

            const { data, headers } = await axios(url, options);

            if (headers['content-encoding'] === 'gzip') {
                const decompressedData = zlib.unzipSync(Buffer.from(data, 'base64'));
                const jsonString = decompressedData.toString('utf8');
                try {
                    const jsonData = JSON.parse(jsonString);
                    return jsonData;
                } catch (jsonError) {
                    console.error("Error parsing JSON:", jsonError);
                    return jsonString;
                }
            } else {
                return data;
            }
        } catch (error) {
            throw new Error(error.message || "Internal server error");
        }
    }
};

module.exports = {
    async crawlLink(link) {
        try {
            const result = await new Promise((resolve, reject) => {
                request(link, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(error || "Internal server error");
                    }
                });
            });
            return result;
        } catch (error) {
            console.error("Error in crawlLink:", error);
            throw error;
        }
    }
};
