// backend/routes/device.js
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/checkAuth.js"); 

const router = express.Router();

router.post("/log", authenticateToken, (req, res) => {
    
    // 1. Get user ID and request data
    const userId = req.user.id; 
    // Get data from the request body (e.g., "Standard TV", 2.5)
    const { deviceName, usageDuration } = req.body;

    // Validate input
    if (!deviceName || !usageDuration) {
        return res.status(400).json({ message: "Missing required fields: deviceName or usageDuration" });
    }
    if (typeof usageDuration !== 'number' || usageDuration <= 0) {
        return res.status(400).json({ message: "usageDuration must be a positive number." });
    }

    // --- START OF 3-STEP LOGIC ---

    // STEP 1: Get the device's consumption rate (kWh/hour)
    const deviceQuery = `
        SELECT factor_id, consumption_rate 
        FROM device_consumption_factors 
        WHERE device_name = ?
    `;
    
    db.query(deviceQuery, [deviceName], (err, deviceResults) => {
        if (err) {
            console.error("DB error fetching device factor:", err);
            return res.status(500).json({ message: "Database error (1)" });
        }
        if (deviceResults.length === 0) {
            return res.status(400).json({ message: "Could not find device factor.", sent: deviceName });
        }

        const deviceFactorId = deviceResults[0].factor_id;
        const consumptionRate = deviceResults[0].consumption_rate; // e.g., 0.12500 kWh/hour

        // STEP 2: Get the user's grid emission factor (kgCO2e/kWh)
        // We find the user's state_code and join with grid_emission_factors to get their rate
        const gridQuery = `
            SELECT g.emission_factor 
            FROM users u
            JOIN grid_emission_factors g ON u.state_code = g.state_code
            WHERE u.user_id = ?
        `;

        db.query(gridQuery, [userId], (err, gridResults) => {
            if (err) {
                console.error("DB error fetching grid factor:", err);
                return res.status(500).json({ message: "Database error (2)" });
            }
            if (gridResults.length === 0) {
                // This means the user's state_code (e.g., 'IN-KA') isn't in grid_emission_factors
                return res.status(400).json({ message: "Could not find grid emission factor for user's location." });
            }

            const gridEmissionFactor = gridResults[0].emission_factor; // e.g., 0.7100 kgCO2e/kWh

            // STEP 3: Calculate emissions and save the log
            
            // First, get total energy in kWh
            // (e.g., 2.5 hours * 0.12500 kWh/hour = 0.3125 kWh)
            const totalEnergyConsumed = usageDuration * consumptionRate;
            
            // Then, get total emissions in kg
            // (e.g., 0.3125 kWh * 0.7100 kgCO2e/kWh = 0.221875 kgCO2e)
            const totalEmissions = totalEnergyConsumed * gridEmissionFactor;

            // Finally, save to the database
            const insertQuery = `
                INSERT INTO device_usage_logs (user_id, device_factor_id, usage_duration, total_emissions) 
                VALUES (?, ?, ?, ?)
            `;
            const insertParams = [userId, deviceFactorId, usageDuration, totalEmissions];

            db.query(insertQuery, insertParams, (err, insertResult) => {
                if (err) {
                    console.error("DB error saving device log:", err);
                    return res.status(500).json({ message: "Database error (3)" });
                }

                // 6. Send success response
                res.status(201).json({
                    message: "Device log saved and emissions calculated!",
                    log_id: insertResult.insertId,
                    calculated_emissions_kg: totalEmissions
                });
            });
        });
    });
});

module.exports = router;