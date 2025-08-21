const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectionString="mongodb+srv://root:root@cluster0.jg6heoy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("chatbotDB"); // use your DB name
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

app.use('/api/chat', chatRoutes);

const PORT = 3000;
app.listen(PORT, () => 
    {console.log(`Server running on port ${PORT}`);
    connectDB();
});
