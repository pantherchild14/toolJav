const request = require("request");
const axios = require("axios");
const zlib = require("zlib");
const fs = require("fs");
const tough = require('tough-cookie');
const CookieJar = tough.CookieJar;
const puppeteer = require('puppeteer');

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
        const cookieJar = new CookieJar();
        try {
            const options = {
                method: "POST",
                headers: {
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    Cookie: 'dm=javlibrary; timezone=-420; __PPU_puid=7342384443788943671; __utma=45030847.595978873.1712324542.1712324542.1712324542.1; __utmz=45030847.1712324542.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=45030847.595978873.1712324542.1712324542.1712324542.1; __utmz=45030847.1712324542.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __qca=P0-2136499392-1712324541837; over18=18; cf_chl_3=5fd7ee6c3753c3a; cf_clearance=mMcYkReC0MojDTQQkIhzAA98U6UQ5f5W3MehoKhgIcw-1712365347-1.0.1.1-3RKpO7lv_urjBtZmWwTcNPvHo1daVdspPmxnMzBnhSDw1yfvjoXho2Hv3h_wXrj8qQL96ZmyvIkpwtIxy.pYIA',
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Sec-Fetch-Site': 'same-origin',
                    // 'Upgrade-Insecure-Requests': '1',
                    // 'Cache-Control': 'no-cache',
                },
                jar: cookieJar,
            };
            const response = await axios.get(link, options);
            return response.data;

        } catch (error) {
            if (error.response && error.response.status === 403) {
                return 'Lỗi 403: Bị từ chối truy cập. Tiếp tục lấy dữ liệu trong 5p...';
            } else {
                console.error('Lỗi:', error.message);
            }
        }
    }
};


// const result = await new Promise((resolve, reject) => {
//     request(link, (error, response, body) => {
//         if (!error && response.statusCode === 200) {
//             resolve(body);
//         } else {
//             reject(error || "Internal server error");
//         }
//     });
// });
// return result;