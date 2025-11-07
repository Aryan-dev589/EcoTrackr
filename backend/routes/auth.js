// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Make sure this is imported
const db = require("../db");

const router = express.Router();

// ------------------- SIGNUP -------------------
router.post("/signup", (req, res) => {
    // Use the correct fields from our schema
    const { username, email, password, country_code, state_code } = req.body;

    if (!username || !email || !password || !country_code || !state_code) {
        return res.status(400).json({ error: "Please fill all required fields" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Use the correct table name ('users') and columns
    db.query(
        "INSERT INTO users (username, email, password_hash, country_code, state_code) VALUES (?, ?, ?, ?, ?)",
        [username, email, hashedPassword, country_code, state_code],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Email or username may already exist." });
            }
            res.status(201).json({ message: "User registered successfully" });
        }
    );
});

// ------------------- LOGIN -------------------
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Use the correct table name ('users')
    const sql = "SELECT * FROM users WHERE email=?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Error checking user:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Create the JWT payload
        const payload = {
            user: {
                id: user.user_id,
                username: user.username,
                state_code: user.state_code // This is essential for energy logs
            }
        };

        // Sign the token using your secret key from .env
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // Make sure JWT_SECRET is in your .env file
            { expiresIn: '1d' }
        );

        // Send the token to the client
        res.status(200).json({
            message: "Login successful",
            token: token // Send the token
        });
    });
});

module.exports = router;