const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");   // make sure db.js is in backend/

const router = express.Router();

// ------------------- SIGNUP -------------------
router.post("/signup", (req, res) => {
  const { name, email, password, city, country } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO user (name, email, password_hash, city, country) VALUES (?, ?, ?, ?, ?)",
    [name, email, hashedPassword, city || null, country || null],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Signup failed" });
      }
      res.json({ message: "User registered successfully" });
    }
  );
});
// LOGIN route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if fields are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Check if user exists
  const sql = "SELECT * FROM user WHERE email=?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];

    // Compare password with hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Success → send user info (you could also send a JWT later)
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        city: user.city,
        country: user.country,
      },
    });
  });
});

// ------------------- GET ALL USERS -------------------
router.get("/users", (req, res) => {
  db.query("SELECT * FROM user", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});


module.exports = router;


