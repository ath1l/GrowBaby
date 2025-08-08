const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get('/resources', async (req, res) => {
  try {
    // Get baby's age
    const baby = await Baby.findOne(); // later, replace with logged-in user's baby
    let ageMonths = 0;

    if (baby) {
      const dob = new Date(baby.dob);
      const today = new Date();
      ageMonths =
        (today.getFullYear() - dob.getFullYear()) * 12 +
        (today.getMonth() - dob.getMonth());
    }

    // Prompt for Gemini
    const prompt = `
      You are a parenting resources assistant.
      The baby is ${ageMonths} months old.
      Give a list of:
      - 3 recommended videos (title + short description + YouTube link)
      - 3 recommended articles/blogs (title + short description + link)
      Keep suggestions relevant to parenting a ${ageMonths}-month-old baby.
      Reply ONLY in JSON format like this:
      {
        "videos": [
          { "title": "", "description": "", "link": "" }
        ],
        "articles": [
          { "title": "", "description": "", "link": "" }
        ]
      }
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    let textOutput = result.response.text();

    // 🔹 Clean markdown formatting if Gemini adds ```json ... ```
    textOutput = textOutput.replace(/```json|```/gi, '').trim();

    let resourcesData;
    try {
      resourcesData = JSON.parse(textOutput);
    } catch (jsonErr) {
      console.error('JSON parsing failed:', jsonErr);
      console.log('Gemini raw output:', textOutput);
      resourcesData = { videos: [], articles: [] };
    }

    res.render('resources', { resources: resourcesData, ageMonths });

  } catch (err) {
    console.error('Error fetching resources:', err);
    res.render('resources', {
      resources: { videos: [], articles: [] },
      ageMonths: 0
    });
  }
});

module.exports = router;
