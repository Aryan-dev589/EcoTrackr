// backend/routes/device.js
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/checkAuth.js"); 

const router = express.Router();

// --- 1. NEW ROUTE: Get all devices for the dropdown ---
router.get("/devices", authenticateToken, (req, res) => {
    const query = `
        SELECT device_name, consumption_rate, unit 
        FROM device_consumption_factors
        ORDER BY device_name ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("DB error fetching devices:", err);
            return res.status(500).json({ message: "Database error" });
        }
        // Send the list of devices back as JSON
        res.json(results);
    });
});

// --- 2. EXISTING ROUTE: Log a new device usage ---
// (This code is unchanged and is 100% correct)
router.post("/log", authenticateToken, (req, res) => {
    
    // 1. Get user ID and request data
    const userId = req.user.id; 
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
                return res.status(400).json({ message: "Could not find grid emission factor for user's location." });
            }

            const gridEmissionFactor = gridResults[0].emission_factor; 

            // STEP 3: Calculate emissions and save the log
            const totalEnergyConsumed = usageDuration * consumptionRate;
            const totalEmissions = totalEnergyConsumed * gridEmissionFactor;

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