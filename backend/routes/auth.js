// backend/routes/auth.js
// --- COPY THIS ENTIRE FILE ---
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); 
const db = require("../db");

const router = express.Router();

// --- SIGNUP (NOW RETURNS A TOKEN) ---
router.post("/signup", (req, res) => {
    const { username, email, password, country_code, state_code, city } = req.body;

    if (!username || !email || !password || !country_code || !state_code || !city) {
        return res.status(400).json({ error: "Please fill all required fields" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
        "INSERT INTO users (username, email, password_hash, country_code, state_code, city) VALUES (?, ?, ?, ?, ?, ?)",
        [username, email, hashedPassword, country_code, state_code, city],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Email or username may already exist." });
            }

            // --- THIS IS THE CRITICAL LOGIC ---
            const newUserId = result.insertId;
            const payload = {
                user: {
                    id: newUserId,
                    username: username,
                    state_code: state_code
                }
            };
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET, 
                { expiresIn: '1d' }
            );

            // Send the token back!
            res.status(201).json({
                message: "User registered successfully",
                token: token // <-- THIS IS WHAT YOU NEED
            });
            // --- END OF CRITICAL LOGIC ---
        }
    );
});

// --- LOGIN (No changes, already correct) ---
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const sql = "SELECT * FROM users WHERE email=?";
    db.query(sql, [email], async (err, results) => {
        if (err) { return res.status(500).json({ error: "Database error" }); }
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const payload = {
            user: {
                id: user.user_id,
                username: user.username,
                state_code: user.state_code
            }
        };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.status(200).json({
            message: "Login successful",
            token: token
        });
    });
});

module.exports = router;