const Baby = require('../models/Baby');

const checkBabyProfile = async (req, res, next) => {
    try {
        // Allow the profile creation page to be accessible
        if (req.path === '/profile') {
            return next();
        }

        // Check if a baby profile exists
        const profile = await Baby.findOne();

        if (!profile) {
            // Redirect to /profile if not found
            return res.redirect('/profile');
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

module.exports = checkBabyProfile;
