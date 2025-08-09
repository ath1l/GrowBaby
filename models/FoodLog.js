const mongoose = require('mongoose');

const FoodLogSchema = new mongoose.Schema({
    babyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Baby',
        required: true
    },
    food: { type: String, required: true },
    quantity: { type: String, required: true }, // e.g. "100g" or "1/2 cup"
    dateEaten: { type: Date, default: Date.now },
    nutrition: {
        calories: String,
        protein: String,
        carbohydrates: String,
        fats: String,
        vitamins: [String],
        minerals: [String],
        advice: String
    }
});

module.exports = mongoose.model('FoodLog', FoodLogSchema);
