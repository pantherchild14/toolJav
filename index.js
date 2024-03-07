const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const cookiePareser = require("cookie-parser");
/* ---------------------------------------------------------------- */
const javRouter = require("./routers/javRouter");
const { javlibraryCrawler } = require("./crawler/javCrawler");
const Connection = require("./configs/mysqlDb");
const uploadURLImageController = require("./controllers/uploadURLImageController");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// app.use(cookiePareser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "./views")
app.use(express.static('public'));
app.use("/", javRouter);


const server = http.createServer(app);

// javlibraryCrawler();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Connection().then(async () => {
//     const server = http.createServer(app);

//     await javlibraryCrawler();

//     server.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}`);
//     });

// }).catch((err) => {
//     console.log("err", err);
// });