// backend/routes/energy.js
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/checkAuth.js"); 

const router = express.Router();

router.post("/log", authenticateToken, (req, res) => {
    
    // 1. Get user ID and request data
    const userId = req.user.id; 
    // Get data from the request body (e.g., 350.5)
    let { kwhConsumed, billingStartDate, billingEndDate } = req.body;

    // Validate input
    if (!kwhConsumed) {
        return res.status(400).json({ message: "Missing required field: kwhConsumed" });
    }
    if (typeof kwhConsumed !== 'number' || kwhConsumed <= 0) {
        return res.status(400).json({ message: "kwhConsumed must be a positive number." });
    }
    
    // Handle optional date fields
    if (!billingStartDate) billingStartDate = null;
    if (!billingEndDate) billingEndDate = null;

    // --- START OF LOGIC ---

    // STEP 1: Get the user's grid emission factor (kgCO2e/kWh)
    // We find the user's state_code and join with grid_emission_factors
    const gridQuery = `
        SELECT g.emission_factor 
        FROM users u
        JOIN grid_emission_factors g ON u.state_code = g.state_code
        WHERE u.user_id = ?
    `;

    db.query(gridQuery, [userId], (err, gridResults) => {
        if (err) {
            console.error("DB error fetching grid factor:", err);
            return res.status(500).json({ message: "Database error (1)" });
        }
        if (gridResults.length === 0) {
            return res.status(400).json({ message: "Could not find grid emission factor for user's location." });
        }

        const gridEmissionFactor = gridResults[0].emission_factor; // e.g., 0.7100 kgCO2e/kWh

        // STEP 2: Calculate emissions and save the log
        
        // (e.g., 350.5 kWh * 0.7100 kgCO2e/kWh = 248.855 kgCO2e)
        const totalEmissions = kwhConsumed * gridEmissionFactor;

        // Finally, save to the database
        const insertQuery = `
            INSERT INTO monthly_energy_logs (user_id, kwh_consumed, billing_start_date, billing_end_date, total_emissions) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const insertParams = [userId, kwhConsumed, billingStartDate, billingEndDate, totalEmissions];

        db.query(insertQuery, insertParams, (err, insertResult) => {
            if (err) {
                console.error("DB error saving energy log:", err);
                return res.status(500).json({ message: "Database error (2)" });
            }

            // 3. Send success response
            res.status(201).json({
                message: "Monthly energy log saved and emissions calculated!",
                log_id: insertResult.insertId,
                calculated_emissions_kg: totalEmissions
            });
        });
    });
});

module.exports = router;