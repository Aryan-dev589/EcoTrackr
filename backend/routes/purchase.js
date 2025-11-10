// backend/routes/purchase.js
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/checkAuth.js"); 

const router = express.Router();

// --- NEW ROUTE: Get all items ---
// This route will be called by the frontend when the page loads
router.get("/items", authenticateToken, (req, res) => {
    const query = `
        SELECT item_name, emission_factor 
        FROM item_embodied_factors
    `;
    // We don't need to sort, but it's nice for the dropdown
    // ORDER BY item_name ASC 

    db.query(query, (err, results) => {
        if (err) {
            console.error("DB error fetching items:", err);
            return res.status(500).json({ message: "Database error" });
        }
        // Send the list of items back as JSON
        res.json(results);
    });
});

// --- EXISTING ROUTE: Log a new purchase ---
// (This code is unchanged and is still correct)
router.post("/log", authenticateToken, (req, res) => {
    
    // 1. Get user ID and request data
    const userId = req.user.id; 
    const { itemName, quantity } = req.body;

    // Validate input
    if (!itemName || !quantity) {
        return res.status(400).json({ message: "Missing required fields: itemName or quantity" });
    }
    
    if (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({ message: "Quantity must be a positive integer." });
    }

    // 2. Find the emission factor and factor_id
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
            return res.status(400).json({ 
                message: "Could not find emission factor for this item.",
                sent: req.body 
            });
        }

        // 3. Get data and calculate emissions
        const factorData = factorResults[0];
        const itemFactorId = factorData.factor_id;
        const emissionFactor = factorData.emission_factor; 

        const totalEmissions = quantity * emissionFactor;

        // 5. Save the complete log
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
});

module.exports = router;