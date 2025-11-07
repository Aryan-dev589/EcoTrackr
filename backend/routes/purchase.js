// backend/routes/purchase.js
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/checkAuth.js"); 

const router = express.Router();

router.post("/log", authenticateToken, (req, res) => {
    
    // 1. Get user ID and request data
    const userId = req.user.id; 
    // Get data from the request body (e.g., "Cotton T-Shirt", 2)
    const { itemName, quantity } = req.body;

    // Validate input
    if (!itemName || !quantity) {
        return res.status(400).json({ message: "Missing required fields: itemName or quantity" });
    }
    
    if (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({ message: "Quantity must be a positive integer." });
    }

    // --- START OF LOGIC ---

    // 2. Find the emission factor and factor_id from your 'item_embodied_factors' table
    const factorQuery = `
        SELECT factor_id, emission_factor 
        FROM item_embodied_factors 
        WHERE item_name = ?
    `;
    const queryParams = [itemName];

    db.query(factorQuery, queryParams, (err, factorResults) => {
        if (err) {
            console.error("DB error fetching item factor:", err);
            return res.status(500).json({ message: "Database error (1)" });
        }

        if (factorResults.length === 0) {
            // No factor found for this item name
            return res.status(400).json({ 
                message: "Could not find emission factor for this item.",
                sent: req.body 
            });
        }

        // 3. Get data and calculate emissions
        const factorData = factorResults[0];
        const itemFactorId = factorData.factor_id;
        const emissionFactor = factorData.emission_factor; // This is in kgCO2e/piece

        // 4. Calculate total emissions (simple multiplication)
        // (e.g., 2 t-shirts * 7.8 kgCO2e/piece = 15.6 kgCO2e)
        const totalEmissions = quantity * emissionFactor;

        // 5. Save the complete log to your 'purchase_logs' table
        const insertQuery = `
            INSERT INTO purchase_logs (user_id, item_factor_id, quantity, total_emissions) 
            VALUES (?, ?, ?, ?)
        `;
        const insertParams = [userId, itemFactorId, quantity, totalEmissions];

        db.query(insertQuery, insertParams, (insertErr, insertResult) => {
            if (insertErr) {
                console.error("DB error saving purchase log:", insertErr);
                return res.status(500).json({ message: "Database error (2)" });
            }

            // 6. Send success response
            res.status(201).json({
                message: "Purchase log saved and emissions calculated!",
                log_id: insertResult.insertId,
                calculated_emissions_kg: totalEmissions
            });
        });
    });
    // --- END OF LOGIC ---
});

module.exports = router;