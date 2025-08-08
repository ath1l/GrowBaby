const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');


// Home page
router.get('/', async (req, res) => {
    const baby = await Baby.findOne(); // adjust query for logged-in user

    let ageMonths = 0;
    let progress = 0;

    if (baby) {
        const dob = new Date(baby.dob);
        const today = new Date();
        ageMonths = (today.getFullYear() - dob.getFullYear()) * 12 +
                    (today.getMonth() - dob.getMonth());

        // Max is 24 months for the bar
        progress = Math.min((ageMonths / 24) * 100, 100);
    }

    res.render('home', { progress, ageMonths });
});


// Profile creation form
router.get('/profile', (req, res) => {
    res.render('profileForm');
});

// Handle profile creation
router.post('/profile', async (req, res) => {
    const { name, dob, gender } = req.body;
    await Baby.create({ name, dob, gender });
    res.redirect('/');
});

module.exports = router;
