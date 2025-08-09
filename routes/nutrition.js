const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');
const FoodLog = require('../models/FoodLog');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get('/nutrition', async (req, res) => {
    try {
        const baby = await Baby.findOne();
        let logs = [];
        let result = null;

        if (baby) {
            logs = await FoodLog.find({ babyId: baby._id }).sort({ dateEaten: -1 }).lean();

            if (req.query.last) {
                const lastLog = await FoodLog.findById(req.query.last).lean();
                if (lastLog) {
                    result = lastLog.nutrition;
                }
            }
        }

        if (req.query.error) {
            result = { error: req.query.error };
        }

        res.render('nutrition', { result, logs });
    } catch (err) {
        console.error(err);
        res.render('nutrition', { result: null, logs: [] });
    }
});

router.get('/nutrition/summary', async (req, res) => {
    try {
        const baby = await Baby.findOne();
        if (!baby) {
            return res.render('nutrition-summary', { summary: [], chartData: [], aiSummary: "" });
        }

        // Calculate date 7 days ago
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 6); // last 7 days (including today)

        // Get logs from the last 7 days
        const logs = await FoodLog.find({
            babyId: baby._id,
            dateEaten: { $gte: weekAgo }
        }).lean();

        // Group by date
        const dailySummary = {};
        logs.forEach(log => {
            const dateKey = new Date(log.dateEaten).toISOString().slice(0, 10); // YYYY-MM-DD

            if (!dailySummary[dateKey]) {
                dailySummary[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            }

            // Convert to numbers if possible
            const cal = parseFloat(log.nutrition.calories) || 0;
            const prot = parseFloat(log.nutrition.protein) || 0;
            const carb = parseFloat(log.nutrition.carbohydrates) || 0;
            const fat = parseFloat(log.nutrition.fats) || 0;

            dailySummary[dateKey].calories += cal;
            dailySummary[dateKey].protein += prot;
            dailySummary[dateKey].carbs += carb;
            dailySummary[dateKey].fats += fat;
        });

        // Sort by date ascending
        const sortedSummary = Object.keys(dailySummary)
            .sort()
            .map(date => ({
                date,
                ...dailySummary[date]
            }));

        // Chart.js dataset
        const chartData = {
            labels: sortedSummary.map(s => s.date),
            calories: sortedSummary.map(s => s.calories),
            protein: sortedSummary.map(s => s.protein),
            carbs: sortedSummary.map(s => s.carbs),
            fats: sortedSummary.map(s => s.fats)
        };

        // --- Generate AI summary using Gemini ---
        let aiSummary = "";
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
            const prompt = ` You are a nutrition report summerizer in a web app.
                Here is the baby's nutrition intake for the last 7 days:
                ${JSON.stringify(sortedSummary, null, 2)}
                
                Please provide a really short, clear summary highlighting trends, highs, lows, 
                and any observations about calorie, protein, carbohydrate, and fat intake.
                Don't include bold ,headings, etc.. .
            `;
            const result = await model.generateContent(prompt);
            aiSummary = result.response.text();
        } catch (aiErr) {
            console.error("Gemini API Error:", aiErr);
            aiSummary = "AI summary could not be generated.";
        }

        res.render('nutrition-summary', { summary: sortedSummary, chartData, aiSummary });

    } catch (err) {
        console.error("Nutrition Summary Error:", err);
        res.render('nutrition-summary', { summary: [], chartData: [], aiSummary: "" });
    }
});


router.post('/nutrition', async (req, res) => {
    const { food, quantity, dateEaten } = req.body;

    try {
        const baby = await Baby.findOne();
        if (!baby) {
            return res.redirect('/nutrition?error=Baby profile not found');
        }

        const dob = new Date(baby.dob);
        const today = new Date();
        const ageMonths =
            (today.getFullYear() - dob.getFullYear()) * 12 +
            (today.getMonth() - dob.getMonth());

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

        // Save log
        const log = new FoodLog({
            babyId: baby._id,
            food,
            quantity,
            dateEaten: dateEaten ? new Date(dateEaten) : new Date(),
            nutrition: structuredData
        });
        await log.save();

        // Redirect to GET with result ID in query
        res.redirect(`/nutrition?last=${log._id}`);

    } catch (err) {
        console.error("Gemini Nutrition Error:", err);
        res.redirect('/nutrition?error=Failed to analyze food');
    }
});


module.exports = router;
