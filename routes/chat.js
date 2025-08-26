const express = require('express');
const router = express.Router();
const { sendMessageToGemini } = require('../services/geminiService');
const authenticToken = require("../routes/midleware/authMiddleware");
const { MongoClient } = require("mongodb")
const { ObjectId } = require("mongodb");

let db
(async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db("chatbot");
    console.log("chat connected to db");


  } catch (error) {
    console.error("Authroute not connected to db")
  }
})()

router.post('/', authenticToken, async (req, res) => {
  try {
    const users = db.collection("users")
    const userMessage = req.body.message;

    const userEntry = { from: "User", text: userMessage, timestamp: new Date() }
    const botResponse = await sendMessageToGemini(userMessage);
    const botEntry = { from: "Bot", text: botResponse, timestamp: new Date() }

    users.updateOne(
      { _id: new ObjectId(res.user.id) },
      { $push: { chatHostory: { $each: [userEntry, botEntry] } } }
    )
    
    const updatedUser = await users.findOne({ _id: new ObjectId(res.user.id) });
    res.json({ response: botResponse })

    console.log(res.user);
    // const response = await sendMessageToGemini(userMessage);
    // res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).send('Gemini API error');
  }
});

module.exports = router;
