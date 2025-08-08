const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');
const Milestone = require('../models/milestone');

// GET all milestones and render the page
router.get('/milestone', async (req, res) => {
    try {
        const baby = await Baby.findOne();
        if (!baby) {
            return res.redirect('/profile');
        }

        const milestones = await Milestone.find({ babyId: baby._id }).sort({ date: -1 });
        res.render('milestone', { milestones, babyName: baby.name });
    } catch (err) {
        console.error('Error fetching milestones:', err);
        res.status(500).send('Server Error');
    }
});

// POST a new milestone
router.post('/milestone', async (req, res) => {
    try {
        const baby = await Baby.findOne();
        if (!baby) {
            return res.redirect('/profile');
        }

        const { title, description } = req.body;
        const newMilestone = new Milestone({
            babyId: baby._id,
            title,
            description
        });

        await newMilestone.save();
        res.redirect('/milestone');
    } catch (err) {
        console.error('Error adding milestone:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;