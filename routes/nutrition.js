const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET nutrition input page
router.get('/nutrition', (req, res) => {
    res.render('nutrition', { result: null });
});

// POST and render directly to /nutrition
router.post('/nutrition', async (req, res) => {
    const { food } = req.body;

    try {
        const baby = await Baby.findOne();
        let ageMonths = 0;

        if (baby) {
            const dob = new Date(baby.dob);
            const today = new Date();
            ageMonths =
                (today.getFullYear() - dob.getFullYear()) * 12 +
                (today.getMonth() - dob.getMonth());
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                calories: { type: SchemaType.STRING },
                protein: { type: SchemaType.STRING },
                carbohydrates: { type: SchemaType.STRING },
                fats: { type: SchemaType.STRING },
                vitamins: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                minerals: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                advice: { type: SchemaType.STRING }
            },
            required: ["calories", "protein", "carbohydrates", "fats", "vitamins", "minerals", "advice"]
        };

        const prompt = `
            Analyze the food "${food}" for a baby of ${ageMonths} months.
            Give approximate nutritional values.
            Vitamins and minerals should be listed as arrays.
            Advice should be a short 3-line parenting tip about this food.
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const structuredData = JSON.parse(result.response.text());
        console.log("Gemini structured data:", structuredData);

        // Render nutrition.ejs with result
        res.render('nutrition', { result: structuredData });

    } catch (err) {
        console.error("Gemini Nutrition Error:", err);
        res.render('nutrition', { result: { error: "Failed to analyze food" } });
    }
});

module.exports = router;
