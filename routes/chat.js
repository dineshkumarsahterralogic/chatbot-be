const express = require('express');
const router = express.Router();
const { sendMessageToGemini } = require('../services/geminiService');
const authenticToken  =require("../routes/midleware/authMiddleware")

router.post('/', authenticToken, async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await sendMessageToGemini(userMessage);
    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).send('Gemini API error');
  }
});

module.exports = router;
