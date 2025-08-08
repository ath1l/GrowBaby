const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');

// Home page
router.get('/', (req, res) => {
    res.render('home');
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
