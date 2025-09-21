const express = require("express");
const router = express.Router();
const db = require("../db");

// ----------------- Log a Trip -----------------
router.post("/log", (req, res) => {
  const { user_id, mode, fuel_type, car_size, start_location, end_location, distance_km } = req.body;

  if (!user_id || !mode || !distance_km) {
    return res.status(400).json({ error: "User ID, mode, and distance are required" });
  }

  // Fetch emission factor
  let query = "SELECT factor FROM emissionfactors WHERE mode = ? AND fuel_type = ?";
  let params = [mode, fuel_type];

  if (mode === "car") {
    query += " AND car_size = ?";
    params.push(car_size);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length === 0) return res.status(404).json({ error: "No emission factor found" });

    const emissionFactor = results[0].factor;
    const emission = distance_km * emissionFactor;

    // Insert trip log
    const insertQuery = `
      INSERT INTO travellogs (user_id, mode, fuel_type, car_size, start_location, end_location, distance_km, emission, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    db.query(
      insertQuery,
      [user_id, mode, fuel_type || null, car_size || null, start_location || null, end_location || null, distance_km, emission],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to log travel" });

        res.json({
          message: "Travel log saved successfully",
          travel_id: result.insertId,
          emission: emission.toFixed(2) + " kg CO₂"
        });
      }
    );
  });
});

// ----------------- Get Latest Trip -----------------
router.get("/latest/:user_id", (req, res) => {
  const { user_id } = req.params;
  db.query(
    "SELECT * FROM travellogs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(results[0] || { message: "No trips found" });
    }
  );
});

// ----------------- Get Daily Emission -----------------
router.get("/daily/:user_id", (req, res) => {
  const { user_id } = req.params;
  db.query(
    "SELECT COALESCE(SUM(emission), 0) AS daily_emission FROM travellogs WHERE user_id = ? AND DATE(created_at) = CURDATE()",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ daily_emission: results[0].daily_emission });
    }
  );
});

// ----------------- Get Monthly Emission -----------------
router.get("/monthly/:user_id", (req, res) => {
  const { user_id } = req.params;
  db.query(
    "SELECT COALESCE(SUM(emission), 0) AS monthly_emission FROM travellogs WHERE user_id = ? AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ monthly_emission: results[0].monthly_emission });
    }
  );
});

module.exports = router;
