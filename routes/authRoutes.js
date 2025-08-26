const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
const authenticToken = require("./midleware/authMiddleware");


const router = express.Router();
let db;
const SECRET_KEY = process.env.WEBTOKE_SEC_KEY;
(async () => {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        db = client.db("chatbot");
        console.log("Authroute connected to db");


    } catch (error) {
        console.error("Authroute not connected to db")
    }
})()


//signup
router.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: "username password required" })

        }
        const existUser = await db.collection("users").findOne({ username })
        if (existUser) {
            return res.status(400).json({ error: "User already exist" })
        }
        const hashPass = await bcrypt.hash(password, 10);
        const result = await db.collection("users").insertOne({
            username,
            password: hashPass,
            createdAt: new Date()

        })
        res.status(201).json({ message: "user created successfully!", id: result.insertedId })
    } catch (error) {
        console.log("signUp error", error);
        res.status(500).json({ error: "Internal service error" })

    }
})

router.get("/me", authenticToken, async (req, res) => {
    try {
        console.log("dfvsd  me "+res.user.id);
        
        const user = await db.collection("users").findOne(
            {
                _id: new ObjectId(res.user.id)
            },
            {
                projection: { password: 0 }
            }
        )
        console.log(user);
        
        if (!user) {
            res.status(404).json({ error: "user not fond" })
        }
        res.json(user)
    } catch (error) {

    }

})


router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await db.collection("users").findOne({ username });
    if (!user) {
        return res.status(401).json({ error: "ivalid user" })
    }

    if (username !== user.username) {
        return res.status(401).json({ error: "Invalid username" })

    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {

        return res.status(401).json({ error: "Invalid password" })
    }

    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, {
        expiresIn: '1h'
    })
    res.json({ token })
})

module.exports = router;