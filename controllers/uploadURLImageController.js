const axios = require('axios');
const fs = require('fs');
const path = require('path');


async function downloadImages(imageUrls, localDirectory) {
    const downloadPromises = imageUrls.map(async (imageUrl, index) => {
        try {
            const response = await axios({
                method: 'GET',
                url: imageUrl,
                responseType: 'stream',
            });
            // pathname URL
            const parsedUrl = new URL(imageUrl);
            const pathname = parsedUrl.pathname;
            const filename = path.basename(pathname);

            const localPath = `${localDirectory}/${filename}`;

            // Pipe the image stream to a local file
            response.data.pipe(fs.createWriteStream(localPath));

            return new Promise((resolve, reject) => {
                response.data.on('end', () => resolve(localPath));
                response.data.on('error', (error) => reject(error));
            });
        } catch (error) {
            throw error;
        }
    });

    return Promise.all(downloadPromises);
}

async function uploadURLImageController(imageUrls, localDirectory) {
    try {
        await downloadImages(imageUrls, localDirectory);
    } catch (error) {
        console.error('Error downloading images:', error);
    }
}

module.exports = uploadURLImageController


