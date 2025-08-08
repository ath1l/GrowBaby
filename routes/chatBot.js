const express = require('express');
const router = express.Router();


// Home page
router.get('/bot', (req, res) => {
    res.render('bot.ejs');
});

module.exports = router;