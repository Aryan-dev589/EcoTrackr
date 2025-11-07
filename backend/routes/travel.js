// backend/routes/travel.js
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/checkAuth.js"); 

const router = express.Router();

router.post("/log", authenticateToken, (req, res) => {
    
    // 1. Get user ID and request data
    const userId = req.user.id; 
    // Get data from the request body (e.g., "Lower medium", "Petrol", 150)
    const { categoryName, fuelType, distance } = req.body;

    // Validate input
    if (!categoryName || !fuelType || !distance) {
        return res.status(400).json({ message: "Missing required fields: categoryName, fuelType, or distance" });
    }

    // --- START OF NEW LOGIC ---

    // 2. Find the emission factor and factor_id from your 'vehicle_emission_factors' table
    const factorQuery = `
        SELECT factor_id, emission_factor, unit 
        FROM vehicle_emission_factors 
        WHERE category_name = ? AND fuel_type = ?
    `;
    const queryParams = [categoryName, fuelType];

    db.query(factorQuery, queryParams, (err, factorResults) => {
        if (err) {
            console.error("DB error fetching factor:", err);
            return res.status(500).json({ message: "Database error (1)" });
        }

        if (factorResults.length === 0) {
            // No factor found for this combination
            return res.status(400).json({ 
                message: "Could not find emission factor for this combination.",
                sent: req.body 
            });
        }

        // 3. Get data and calculate emissions
        const factorData = factorResults[0];
        const vehicleFactorId = factorData.factor_id; // The ID of the factor (e.g., 5)
        const emissionFactor = factorData.emission_factor; // The gCO2e/km value (e.g., 145.3700)
        
        let totalEmissions = distance * emissionFactor; // This is in grams (gCO2e)

        // 4. IMPORTANT: Convert grams to kilograms for storage
        // Your factor is in 'gCO2e/km'. It's best to store 'total_emissions' in kg.
        // Your 'total_emissions' column (decimal 10,4) is perfect for this.
        if (factorData.unit === 'gCO2e/km') {
            totalEmissions = totalEmissions / 1000; // Convert g to kg
        }

        // 5. Save the complete log to your 'travel_logs' table
        const insertQuery = `
            INSERT INTO travel_logs (user_id, vehicle_factor_id, distance, total_emissions) 
            VALUES (?, ?, ?, ?)
        `;
        // Note: log_date is set automatically by MySQL (CURRENT_TIMESTAMP)
        const insertParams = [userId, vehicleFactorId, distance, totalEmissions];

        db.query(insertQuery, insertParams, (insertErr, insertResult) => {
            if (insertErr) {
                console.error("DB error saving log:", insertErr);
                return res.status(500).json({ message: "Database error (2)" });
            }

            // 6. Send success response
            res.status(201).json({ // 201 "Created" is a good status for this
                message: "Travel log saved and emissions calculated!",
                log_id: insertResult.insertId,
                calculated_emissions_kg: totalEmissions
            });
        });
    });
    // --- END OF NEW LOGIC ---
});

module.exports = router;