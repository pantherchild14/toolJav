const dotenv = require("dotenv");
const cheerio = require("cheerio");
const { crawlLink } = require("../configs/crawl");
const { javLibaryControllerDB } = require("../controllers/javController");
const uploadURLImageController = require("../controllers/uploadURLImageController");

dotenv.config();


module.exports = {
    async javlibraryCrawler(DOMAIN) {
        try {
            const replacedUrlFT = `https://www.javlibrary.com/en/vl_searchbyid.php?keyword=${await encodeURIComponent(DOMAIN)}`;
            const htmlData = await crawlLink(replacedUrlFT);
            const $ = cheerio.load(htmlData);
            const keyIdJav = await encodeURIComponent(DOMAIN);

            let javList = {
                VideoJacketImage: [],
                ID: [],
                TITLE: [],
                ReleaseDate: [],
                Length: [],
                Director: [],
                Maker: [],
                Label: [],
                UserRating: [],
                Genre: [],
                Cast: [],
                PreviewImage: [],
                UploadFileImage: [],
                linkUrl: [],
            };

            const checkHTMLSearchIdJav = $('.videothumblist .videos');
            checkHTMLSearchIdJav.each((_, element) => {
                const videoElements = $(element).find('.video');
                videoElements.each((_, videoElement) => {
                    const id = $(videoElement).find('.id').text().trim();
                    if (id === keyIdJav) {
                        const idHref = $(videoElement).find('a').attr('href').split('=')[1];
                        javList.linkUrl.push(idHref);
                    }
                });
            });



            if (javList.linkUrl.length > 0) {
                const replacedUrlFT = `https://www.javlibrary.com/en/?v=${await encodeURIComponent(javList.linkUrl)}`;
                const htmlData = await crawlLink(replacedUrlFT);
                const $ = cheerio.load(htmlData);
                // crawl Image 
                const videoJacketImgUrl = $('#video_jacket_img').attr('src');
                javList.VideoJacketImage.push(videoJacketImgUrl);

                //crawl Id
                const idElement = $('#video_id .text');
                const videoId = idElement.text().trim();
                javList.ID.push(videoId);

                //crawl Title
                const titleElement = $('#video_title .text');
                const videoTitle = titleElement.text().trim();
                javList.TITLE.push(videoTitle);

                // crawl Date
                const dateElement = $('#video_date .text');
                const videoDate = dateElement.text().trim();
                javList.ReleaseDate.push(videoDate);

                // crawl Lenght
                const lenghtElement = $('#video_length .text');
                const videoLenght = lenghtElement.text().trim();
                javList.Length.push(videoLenght);

                // crawl Director
                const directorElement = $('#video_director .text');
                const videoDerector = directorElement.text().trim();
                javList.Director.push(videoDerector);

                // crawl Maker
                const makerElement = $('#video_maker .text');
                const videoMaker = makerElement.text().trim();
                javList.Maker.push(videoMaker);

                // crawl Laber
                const labelElement = $('#video_label .text');
                const videoLabel = labelElement.text().trim();
                javList.Label.push(videoLabel);

                // crawl genres
                const genresElement = $('#video_genres .text span.genre a');
                genresElement.each((_, element) => {
                    const temp = $(element).text().trim();
                    javList.Genre.push(temp);
                });

                // crawl cast
                const castElement = $('#video_cast .text');
                const videoCast = castElement.text().trim();
                javList.Cast.push(videoCast);

                // crawl Preview Image
                const imageLinks = $('div.previewthumbs a:has(img[width="120"][height="90"])').map((_, element) => {
                    if ($(element).attr('href') === '#') {
                        return;
                    } else {
                        return $(element).attr('href');
                    }
                }).get();
                javList.PreviewImage.push(imageLinks);
                javList.UploadFileImage.push(imageLinks);
                javList.UploadFileImage = imageLinks.concat([videoJacketImgUrl]);
            } else {
                // crawl Image 
                const videoJacketImgUrl = $('#video_jacket_img').attr('src');
                javList.VideoJacketImage.push(videoJacketImgUrl);

                //crawl Id
                const idElement = $('#video_id .text');
                const videoId = idElement.text().trim();
                javList.ID.push(videoId);

                //crawl Title
                const titleElement = $('#video_title .text');
                const videoTitle = titleElement.text().trim();
                javList.TITLE.push(videoTitle);

                // crawl Date
                const dateElement = $('#video_date .text');
                const videoDate = dateElement.text().trim();
                javList.ReleaseDate.push(videoDate);

                // crawl Lenght
                const lenghtElement = $('#video_length .text');
                const videoLenght = lenghtElement.text().trim();
                javList.Length.push(videoLenght);

                // crawl Director
                const directorElement = $('#video_director .text');
                const videoDerector = directorElement.text().trim();
                javList.Director.push(videoDerector);

                // crawl Maker
                const makerElement = $('#video_maker .text');
                const videoMaker = makerElement.text().trim();
                javList.Maker.push(videoMaker);

                // crawl Laber
                const labelElement = $('#video_label .text');
                const videoLabel = labelElement.text().trim();
                javList.Label.push(videoLabel);

                // crawl genres
                const genresElement = $('#video_genres .text span.genre a');
                genresElement.each((_, element) => {
                    const temp = $(element).text().trim();
                    javList.Genre.push(temp);
                });

                // crawl cast
                const castElement = $('#video_cast .text span.star a');
                castElement.each((_, element) => {
                    const temp = $(element).text().trim();
                    javList.Cast.push(temp);
                });

                // // const videoCast = castElement.text().trim();
                // javList.Cast.push(videoCast);

                // crawl Preview Image
                const imageLinks = $('div.previewthumbs a:has(img[width="120"][height="90"])').map((_, element) => {
                    if ($(element).attr('href') === '#') {
                        return;
                    } else {
                        return $(element).attr('href');
                    }
                }).get();
                javList.PreviewImage.push(imageLinks);
                javList.UploadFileImage.push(imageLinks);
                javList.UploadFileImage = imageLinks.concat([videoJacketImgUrl]);
            }


            // const localDirectory = `public/images/${keyIdJav}`;
            // const ftpConfig = {
            //     host: '78.46.22.123',
            //     user: 'ftp_images_dudedata_xyz',
            //     password: 'GMPNEH6A8REijDEx',
            //     secure: false, // Set to true if FTP server requires SSL/TLS
            // };
            // await uploadURLImageController(javList.UploadFileImage, localDirectory, ftpConfig, keyIdJav);
            // await uploadURLImageController(javList.UploadFileImage, localDirectory);

            // await javLibaryControllerDB(javList);

            return javList;
        } catch (error) {
            throw new Error(error.message || "Internal server error");
        }
    }
};