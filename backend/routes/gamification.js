// backend/routes/gamification.js
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/checkAuth.js");

const router = express.Router();

// --- Endpoint 1: GET All Badges & User's Earned Status ---
// This is the "Trophy Case" API
router.get("/badges", authenticateToken, (req, res) => {
  const userId = req.user.id;

  // This one smart query fetches ALL badges from the "rulebook"
  // and simultaneously checks (via LEFT JOIN) which ones the user
  // has in their "trophy case" (user_badges).
  const query = `
    SELECT 
      b.badge_id, 
      b.title, 
      b.description, 
      b.icon_class,
      CASE WHEN ub.user_id IS NOT NULL THEN true ELSE false END as isEarned
    FROM badges b
    LEFT JOIN user_badges ub 
      ON b.badge_id = ub.badge_id 
      AND ub.user_id = ?
    ORDER BY isEarned DESC, title ASC;
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user badges:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    // Send the full list (e.g., 11 badges) with the 'isEarned' flag
    res.json(results);
  });
});

// We can add other gamification routes here later (like /api/gamification/streak)

module.exports = router;