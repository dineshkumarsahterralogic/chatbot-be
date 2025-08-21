const axios = require('axios');
const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("----------------->",GEMINI_API_KEY);

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Create an agent that skips SSL validation (⚠️ DEV ONLY)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function sendMessageToGemini(message) {
  const requestBody = {
    contents: [{ parts: [{ text: message }] }]
  };

  try {
    const response = await axios.post(GEMINI_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' },
      httpsAgent // inject the agent
    });

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return content || "No response from Gemini.";

  } catch (error) {
    console.error("Gemini API error:", error.message);
    return "Error communicating with Gemini.";
  }
}

module.exports = { sendMessageToGemini };
