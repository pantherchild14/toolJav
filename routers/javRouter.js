const express = require("express");
const { javlibraryCrawler } = require("../crawler/javCrawler");
const { getJavaLibaryControllerDB } = require("../controllers/javController");
const router = express.Router();

/* --------------------------------------------- */


router.get('/jav', (req, res) => {
    res.render("javaView", { title: 'hii' });
});

router.post('/jav', async (req, res) => {
    try {
        const inputValue = req.body.inputValue;
        const data = await javlibraryCrawler(inputValue);

        res.redirect(`/jav/${data}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/jav/:ID', async (req, res) => {
    try {
        const ID = req.params.ID;

        const results = await getJavaLibaryControllerDB(ID);
        if (!results) {
            return res.status(401).json({ error: 'JAV ID not found' });
        }

        return res.status(200).json({ data: results });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});


module.exports = router;
