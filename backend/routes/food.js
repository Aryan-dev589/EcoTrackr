// backend/routes/food.js
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/checkAuth.js"); 

const router = express.Router();

router.post("/log", authenticateToken, (req, res) => {
    
    // 1. Get user ID and request data
    const userId = req.user.id; 
    // Get data from the request body (e.g., "Poultry Meat", 1.5)
    const { foodName, quantity } = req.body;

    // Validate input
    if (!foodName || !quantity) {
        return res.status(400).json({ message: "Missing required fields: foodName or quantity" });
    }

    // --- START OF LOGIC ---

    // 2. Find the emission factor and factor_id from your 'food_emission_factors' table
    const factorQuery = `
        SELECT factor_id, emission_factor 
        FROM food_emission_factors 
        WHERE food_name = ?
    `;
    const queryParams = [foodName];

    db.query(factorQuery, queryParams, (err, factorResults) => {
        if (err) {
            console.error("DB error fetching food factor:", err);
            return res.status(500).json({ message: "Database error (1)" });
        }

        if (factorResults.length === 0) {
            // No factor found for this food name
            return res.status(400).json({ 
                message: "Could not find emission factor for this food.",
                sent: req.body 
            });
        }

        // 3. Get data and calculate emissions
        const factorData = factorResults[0];
        const foodFactorId = factorData.factor_id;
        const emissionFactor = factorData.emission_factor; // This is in kgCO2e/kg

        // 4. Calculate total emissions (simple multiplication)
        // (e.g., 1.5kg of chicken * 6.9 kgCO2e/kg = 10.35 kgCO2e)
        const totalEmissions = quantity * emissionFactor;

        // 5. Save the complete log to your 'food_logs' table
        const insertQuery = `
            INSERT INTO food_logs (user_id, food_factor_id, quantity, total_emissions) 
            VALUES (?, ?, ?, ?)
        `;
        const insertParams = [userId, foodFactorId, quantity, totalEmissions];

        db.query(insertQuery, insertParams, (insertErr, insertResult) => {
            if (insertErr) {
                console.error("DB error saving food log:", insertErr);
                return res.status(500).json({ message: "Database error (2)" });
            }

            // 6. Send success response
            res.status(201).json({
                message: "Food log saved and emissions calculated!",
                log_id: insertResult.insertId,
                calculated_emissions_kg: totalEmissions
            });
        });
    });
    // --- END OF LOGIC ---
});

module.exports = router;