const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');


// Home page
router.get('/', async (req, res) => {
    const baby = await Baby.findOne(); // adjust query for logged-in user
    const babyName = baby.name;
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

    res.render('home', { progress, ageMonths ,babyName});
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

// Edit profile form
router.get('/profile/edit', async (req, res) => {
    const baby = await Baby.findOne(); // You might filter for logged-in user
    if (!baby) {
        return res.redirect('/profile'); // If no profile exists, go create one
    }
    res.render('editProfileForm', { baby });
});

// Handle edit profile submission
router.post('/profile/edit', async (req, res) => {
    const { name, dob, gender } = req.body;
    const baby = await Baby.findOne();
    if (!baby) {
        return res.redirect('/profile');
    }

    baby.name = name;
    baby.dob = dob;
    baby.gender = gender;
    await baby.save();

    res.redirect('/');
});

module.exports = router;
