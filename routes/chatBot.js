const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatLog = require('../models/ChatLog');

require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get('/', async (req, res) => {
  try {
    const allMessages = await ChatLog.find().sort({ timestamp: 1 }); // oldest first
    const formatted = allMessages.map(log => ({
      user: log.userMessage,
      bot: log.botResponse
    }));
    res.render('bot', { messages: formatted });
  } catch (err) {
    console.error(err);
    res.render('bot', { messages: [] });
  }
});

router.post('/', async (req, res) => {
  const userMessage = req.body.message;
  const baby = await Baby.findOne();

  let ageMonths = 0;
  if (baby) {
    const dob = new Date(baby.dob);
    const today = new Date();
    ageMonths = (today.getFullYear() - dob.getFullYear()) * 12 +
                (today.getMonth() - dob.getMonth());
  }

  const systemPrompt = {
    role: "user",
    parts: [{
      text: `
        You are a chat bot for the GrowBaby web app platform. The baby's name is ${baby ? baby.name : "unknown"} and they are ${ageMonths} months old.
        Give small and precise replies without headings ,bolding,etc.
        Respond in a warm and helpful tone. If the question is unrelated, politely redirect.
      `.trim()
    }]
  };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const allLogs = await ChatLog.find().sort({ timestamp: 1 });
    const trimmedLogs = allLogs.slice(-10);

    const history = [
      systemPrompt,
      ...trimmedLogs.flatMap(log => ([
        { role: "user", parts: [{ text: log.userMessage }] },
        { role: "model", parts: [{ text: log.botResponse }] }
      ]))
    ];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const botResponse = result.response.text();

    await new ChatLog({ userMessage, botResponse }).save();

    // Redirect to GET route instead of rendering
    res.redirect('/chatbot');
  } catch (err) {
    console.error('Gemini error:', err);
    res.redirect('/chatbot'); // Even on error, redirect to avoid resubmit
  }
});



router.post('/clear', async (req, res) => {
  try {
    await ChatLog.deleteMany({});
    res.redirect('/chatbot');
  } catch (err) {
    console.error('Error clearing chat:', err);
    res.status(500).send('Could not clear chat');
  }
});

module.exports = router;
