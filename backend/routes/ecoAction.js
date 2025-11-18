// backend/routes/ecoAction.js
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/checkAuth.js");

const router = express.Router();

// Helper function to get the start of the current month in YYYY-MM-DD format
function getFirstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

// --- Endpoint 1: GET All Eco-Friendly Actions ---
// (This is unchanged and correct)
router.get("/factors", authenticateToken, (req, res) => {
  const query = "SELECT * FROM carbon_savings_factors ORDER BY description ASC";
  
  db.query(query, [], (err, results) => {
    if (err) {
      console.error("Error fetching savings factors:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// --- Endpoint 2: POST a new Eco-Friendly Log (Upgraded with Badge Engine) ---
router.post("/log", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { action_id, quantity } = req.body; 

  if (!action_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid input. 'action_id' and a positive 'quantity' are required." });
  }

  let savedLogId;
  let savedTotalKg;
  const connection = db; 

  // 1. Get the "saved_kg" value and action_name for this action
  const factorQuery = "SELECT action_id, saved_kg, category, action_name FROM carbon_savings_factors WHERE action_id = ?";
  
  connection.query(factorQuery, [action_id], (err, factorResults) => {
    if (err) {
      console.error("DB error fetching factor:", err);
      return res.status(500).json({ message: "Database error (1)" });
    }
    if (factorResults.length === 0) {
      return res.status(404).json({ message: "Eco-action factor not found." });
    }

    const factor = factorResults[0];
    const saved_kg_per_unit = parseFloat(factor.saved_kg);
    
    // 2. Calculate the total savings
    const total_saved_kg = parseFloat(quantity) * saved_kg_per_unit;
    savedTotalKg = total_saved_kg;

    // 3. Save the new log
    const insertQuery = `
      INSERT INTO eco_action_logs (user_id, action_factor_id, quantity, total_saved_kg, log_date)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const insertParams = [userId, action_id, quantity, total_saved_kg];

    connection.query(insertQuery, insertParams, (insertErr, insertResult) => {
      if (insertErr) {
        console.error("DB error saving eco-action log:", insertErr);
        return res.status(500).json({ message: "Database error (2)" });
      }
      
      savedLogId = insertResult.insertId;

      // --- 4. THE BADGE ENGINE ---
      // The log is saved. NOW, check if the user earned any new badges.
      // We pass the new action's details to the engine
      checkAndAwardBadges(userId, (badgeErr, newBadges) => {
        if (badgeErr) {
          console.error("Badge Engine Error:", badgeErr);
          // Still send a success, just with no badges
          return res.status(201).json({
            message: "Eco-action logged successfully! (Badge check failed)",
            log_id: savedLogId,
            total_saved_kg: savedTotalKg,
            newBadgesEarned: [] 
          });
        }
        
        // --- 5. FINAL SUCCESS RESPONSE ---
        // Send the log info *and* any new badges they just earned
        res.status(201).json({
          message: "Eco-action logged successfully!",
          log_id: savedLogId,
          total_saved_kg: savedTotalKg,
          newBadgesEarned: newBadges 
        });
      });
    });
  });
});


// --- THE "BADGE ENGINE" FUNCTION (Corrected and Complete) ---
async function checkAndAwardBadges(userId, callback) {
  try {
    const connection = db.promise(); 
    let newBadges = [];

    // --- 1. Get User's Current State ---
    const [earnedBadgesRows] = await connection.query("SELECT badge_id FROM user_badges WHERE user_id = ?", [userId]);
    const earnedBadges = earnedBadgesRows.map(b => b.badge_id);

    // Get ALL savings logs to check totals, streaks, and categories
    const [savingsLogsRows] = await connection.query(
      "SELECT l.total_saved_kg, l.log_date, f.category, f.action_name, l.quantity " +
      "FROM eco_action_logs l " +
      "JOIN carbon_savings_factors f ON l.action_factor_id = f.action_id " +
      "WHERE l.user_id = ? ORDER BY l.log_date ASC", // Order ASC for streak check
      [userId]
    );
    
    // --- Helper function to check & add a new badge ---
    const awardBadge = async (badgeId) => {
      // Check if badge exists in our 'badges' table and user doesn't have it
      if (!earnedBadges.includes(badgeId)) {
        const [badgeExists] = await connection.query("SELECT 1 FROM badges WHERE badge_id = ?", [badgeId]);
        if (badgeExists.length > 0) {
          await connection.query("INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, NOW())", [userId, badgeId]);
          const [badgeDetails] = await connection.query("SELECT title, description, icon_class FROM badges WHERE badge_id = ?", [badgeId]);
          newBadges.push(badgeDetails[0]);
        }
      }
    };

    // --- 2. Run All Badge Milestone Checks ---

    // Check 1: "Action Taker" (Logged at least 1)
    if (savingsLogsRows.length > 0) {
      await awardBadge('ACTION_TAKER');
    }

    // Check 2: Total Savings Milestones
    const totalSavings = savingsLogsRows.reduce((sum, log) => sum + parseFloat(log.total_saved_kg), 0);
    if (totalSavings >= 100) await awardBadge('BRONZE_SAVER');
    if (totalSavings >= 500) await awardBadge('SILVER_SAVER');
    if (totalSavings >= 1000) await awardBadge('GOLD_SAVER');
    if (totalSavings >= 2000) await awardBadge('ECO_WARRIOR');
    if (totalSavings >= 5000) await awardBadge('GREEN_HERO');

    // Check 3: Consistency (Streak) Milestones
    let consecutiveDays = 0;
    if (savingsLogsRows.length > 0) {
      // Get a sorted list of *unique* days the user has logged
      const uniqueLogDays = [...new Set(savingsLogsRows.map(log => new Date(log.log_date).toISOString().split('T')[0]))];
      uniqueLogDays.sort(); // Sorts from oldest to newest
      
      if (uniqueLogDays.length > 0) {
        consecutiveDays = 1; // Start at 1
        let lastDate = new Date(uniqueLogDays[0]);

        for (let i = 1; i < uniqueLogDays.length; i++) {
          let currentDate = new Date(uniqueLogDays[i]);
          // Calculate the difference in days
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // It's a consecutive day!
            consecutiveDays++;
          } else if (diffDays > 1) {
            // Streak is broken
            consecutiveDays = 1; // Reset to 1 for the current day
          }
          // if diffDays === 0, it's the same day, so do nothing.
          
          lastDate = currentDate;
        }
      }
      
      // Check if today is part of the streak
      const today = new Date().toISOString().split('T')[0];
      if (uniqueLogDays[uniqueLogDays.length - 1] !== today) {
         // The last log wasn't today. Check if it was yesterday.
         const lastLogDate = new Date(uniqueLogDays[uniqueLogDays.length - 1]);
         const todayDate = new Date(today);
         const diffTime = Math.abs(todayDate.getTime() - lastLogDate.getTime());
         const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays > 1) {
           consecutiveDays = 0; // Streak is broken
         }
      }
      
      if (consecutiveDays >= 7) await awardBadge('WEEKLY_WARRIOR');
      if (consecutiveDays >= 30) await awardBadge('MONTHLY_MASTER');
    }

    // Check 4: Variety (Category) Milestones
    const loggedCategories = [...new Set(savingsLogsRows.map(log => log.category))]; 
    if (loggedCategories.includes('Food') && 
        loggedCategories.includes('Travel') && 
        loggedCategories.includes('Energy') && 
        loggedCategories.includes('Purchase')) {
      await awardBadge('ECO_EXPLORER');
    }
    
    // Check 5: Specific Action Milestones (Tree Planter)
    const totalTreesPlanted = savingsLogsRows
      .filter(log => log.action_name === 'PLANT_NATIVE_SAPLING')
      .reduce((sum, log) => sum + parseFloat(log.quantity), 0); // Sum the *quantity* of trees
      
    if (totalTreesPlanted >= 70) {
      await awardBadge('TREE_PLANTER');
    }
    
    // Check 6: Balancing (Net Zero Hero)
    const firstDay = getFirstDayOfMonth();
    
    // Get total emissions for the month
    const [emissionsResult] = await connection.query(
      "SELECT SUM(total_emissions) as total FROM (" +
      " (SELECT total_emissions FROM travel_logs WHERE user_id = ? AND log_date >= ?)" +
      " UNION ALL (SELECT total_emissions FROM food_logs WHERE user_id = ? AND log_date >= ?)" +
      " UNION ALL (SELECT total_emissions FROM purchase_logs WHERE user_id = ? AND log_date >= ?)" +
      " UNION ALL (SELECT total_emissions FROM device_usage_logs WHERE user_id = ? AND log_date >= ?)" +
      " UNION ALL (SELECT total_emissions FROM monthly_energy_logs WHERE user_id = ? AND billing_end_date >= ?)" +
      ") as all_emissions",
      [userId, firstDay, userId, firstDay, userId, firstDay, userId, firstDay, userId, firstDay]
    );

    // Get total savings for the month
    const [savingsResult] = await connection.query("SELECT SUM(total_saved_kg) as total FROM eco_action_logs WHERE user_id = ? AND log_date >= ?", [userId, firstDay]);
    
    const monthlyEmissions = parseFloat(emissionsResult[0]?.total) || 0;
    const monthlySavings = parseFloat(savingsResult[0]?.total) || 0;
    
    if (monthlySavings > monthlyEmissions && monthlyEmissions > 0) {
      await awardBadge('NET_ZERO_HERO');
    }
    
    // --- 3. Return all newly earned badges ---
    callback(null, newBadges);

  } catch (err) {
    callback(err, null); // Send the error back
  }
}

module.exports = router;