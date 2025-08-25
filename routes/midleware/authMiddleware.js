const jwt = require("jsonwebtoken");
const SCRET_KEY = process.env.WEBTOKE_SEC_KEY;

function authenticToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ error: "No token provided" })

    }
    jwt.verify(token, SCRET_KEY, (error, user) => {
        if (error) {
            res.status(403).json({ error: "Invalid token" })
        }
        res.user = user;
        next();

    })
}
module.exports = authenticToken;