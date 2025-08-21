const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const chatRoutes = require('./routes/chat');
const { MongoClient } = require('mongodb')
const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient(process.env.MONGO_URI);
let db
async function connectDB() {
  try {
    await client.connect();
    db = client.db("chatbot"); // use your DB name
    console.log("✅ Connected to MongoDB");

    // Example route
    app.get("/api/messages", async (req, res) => {
      const messages = await db.collection("message").find().toArray();
      res.json(messages);
    });

    app.post("/api/message", async (req, res) => {

      try {
        const { user, text } = req.body;

        if (!text || !user) {
          return res.status(400).json({ error: "user and text are required" })
        }

        const result = await db.collection("message").insertOne({
          user, text, date: new Date()
        });
        res.json({ success: true, id: result.insertedId });

      } catch (error) {
        console.error("❌ Error inserting message:", err);
        res.status(500).json({ error: "Internal server error" });

      }
    })

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

connectDB();

app.use('/api/chat', chatRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

