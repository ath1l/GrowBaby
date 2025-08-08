const mongoose = require('mongoose');

const babySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    }
});

module.exports = mongoose.model('Baby', babySchema);
