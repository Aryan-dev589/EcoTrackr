// backend/routes/coach.js
const express = require("express");
const db = require("../db"); // Your database connection
const { authenticateToken } = require("../middleware/checkAuth.js");

const router = express.Router();

// Helper function to get the start of the current month in YYYY-MM-DD format
function getFirstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

// --- Endpoint 1: The "Facts Engine" (for Skill 1) ---
// Gets the user's hotspots and high-impact logs
router.get("/insights", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const firstDayOfMonthISO = getFirstDayOfMonth();

  // --- 1. Define SQL Queries ---
  
  // Query 1: Get the monthly breakdown (for hotspot)
  const breakdownQuery = `
    SELECT 
      SUM(CASE WHEN category = 'travel' THEN total_emissions ELSE 0 END) as travel,
      SUM(CASE WHEN category = 'food' THEN total_emissions ELSE 0 END) as food,
      SUM(CASE WHEN category = 'purchase' THEN total_emissions ELSE 0 END) as purchase
    FROM (
      (SELECT total_emissions, 'travel' as category FROM travel_logs WHERE user_id = ? AND log_date >= ?)
      UNION ALL
      (SELECT total_emissions, 'food' as category FROM food_logs WHERE user_id = ? AND log_date >= ?)
      UNION ALL
      (SELECT total_emissions, 'purchase' as category FROM purchase_logs WHERE user_id = ? AND log_date >= ?)
    ) as monthly_logs;
  `;
  const breakdownParams = [userId, firstDayOfMonthISO, userId, firstDayOfMonthISO, userId, firstDayOfMonthISO];

  // Query 2: Handle Energy (Either/Or)
  const energyQuery = `(SELECT SUM(total_emissions) as energyTotal FROM monthly_energy_logs WHERE user_id = ? AND billing_end_date >= ? ORDER BY billing_end_date DESC LIMIT 1)`;
  const energyParams = [userId, firstDayOfMonthISO];
  
  const deviceEnergyQuery = `SELECT SUM(total_emissions) as energyTotal FROM device_usage_logs WHERE user_id = ? AND log_date >= ?`;
  const deviceEnergyParams = [userId, firstDayOfMonthISO];

  // Query 3: Get Top 3 High-Impact Logs
  const allLogsQuery = `
    (
      SELECT l.total_emissions, v.category_name as name
      FROM travel_logs l JOIN vehicle_emission_factors v ON l.vehicle_factor_id = v.factor_id
      WHERE l.user_id = ? AND l.log_date >= ?
    ) UNION ALL (
      SELECT l.total_emissions, f.food_name as name
      FROM food_logs l JOIN food_emission_factors f ON l.food_factor_id = f.factor_id
      WHERE l.user_id = ? AND l.log_date >= ?
    ) UNION ALL (
      SELECT l.total_emissions, i.item_name as name
      FROM purchase_logs l JOIN item_embodied_factors i ON l.item_factor_id = i.factor_id
      WHERE l.user_id = ? AND l.log_date >= ?
    ) UNION ALL (
      SELECT l.total_emissions, d.device_name as name
      FROM device_usage_logs l JOIN device_consumption_factors d ON l.device_factor_id = d.factor_id
      WHERE l.user_id = ? AND l.log_date >= ?
    )
    ORDER BY total_emissions DESC
    LIMIT 3;
  `;
  const allLogsParams = [
    userId, firstDayOfMonthISO, 
    userId, firstDayOfMonthISO, 
    userId, firstDayOfMonthISO, 
    userId, firstDayOfMonthISO
  ];
  
  // --- 2. Create Promises ---
  const pBreakdown = new Promise((resolve, reject) => db.query(breakdownQuery, breakdownParams, (err, r) => err ? reject(err) : resolve(r)));
  const pEnergy = new Promise((resolve, reject) => db.query(energyQuery, energyParams, (err, r) => err ? reject(err) : resolve(r)));
  const pDeviceEnergy = new Promise((resolve, reject) => db.query(deviceEnergyQuery, deviceEnergyParams, (err, r) => err ? reject(err) : resolve(r)));
  const pAllLogs = new Promise((resolve, reject) => db.query(allLogsQuery, allLogsParams, (err, r) => err ? reject(err) : resolve(r)));

  // --- 3. Run all queries ---
  Promise.all([pBreakdown, pEnergy, pDeviceEnergy, pAllLogs])
    .then(([breakdownResult, energyResult, deviceEnergyResult, allLogsResult]) => {

      // --- 4. Process the Data ---
      const breakdown = breakdownResult[0];
      const monthlyBillTotal = parseFloat(energyResult[0]?.energyTotal) || 0;
      let energyTotal;
      if (monthlyBillTotal > 0) {
        energyTotal = monthlyBillTotal;
      } else {
        energyTotal = parseFloat(deviceEnergyResult[0]?.energyTotal) || 0;
      }
      
      const monthlyBreakdown = {
          travel: parseFloat(breakdown.travel) || 0,
          food: parseFloat(breakdown.food) || 0,
          purchase: parseFloat(breakdown.purchase) || 0,
          energy: energyTotal
      };

      const monthlyTotal = 
        monthlyBreakdown.travel +
        monthlyBreakdown.food +
        monthlyBreakdown.purchase +
        monthlyBreakdown.energy;

      // Find Hotspot
      let hotspot = { category: 'None', value: 0 };
      if (monthlyTotal > 0) {
        for (const [category, value] of Object.entries(monthlyBreakdown)) {
          if (value > hotspot.value) {
            hotspot.category = category;
            hotspot.value = value;
          }
        }
      }
      
      // --- THIS IS THE FIX ---
      // Get High Impact Logs
      // We must use parseFloat() on the string *before* calling .toFixed()
      const highImpactLogs = allLogsResult.map(log => ({
        name: log.name,
        emissions: parseFloat(parseFloat(log.total_emissions).toFixed(1))
      }));
      // --- END OF FIX ---

      // --- 5. Send the Final "Fact Sheet" JSON ---
      res.json({
        monthlyTotal: parseFloat(monthlyTotal.toFixed(1)),
        hotspot: {
          category: hotspot.category.charAt(0).toUpperCase() + hotspot.category.slice(1),
          percentage: (monthlyTotal > 0 ? (hotspot.value / monthlyTotal) * 100 : 0).toFixed(0)
        },
        highImpactLogs: highImpactLogs,
      });
      
    })
    .catch(err => {
      console.error("Coach insights data error:", err);
      res.status(500).json({ message: "Error fetching coach insights" });
    });
});


// --- Endpoint 2: The "Savings Tool" (for Skill 2) ---
// (This endpoint is already correct)
router.get("/find-savings", authenticateToken, (req, res) => {
  const userId = req.user.id;
  let targetAmount = parseFloat(req.query.amount);

  if (!targetAmount || targetAmount <= 0) {
    return res.status(400).json({ message: "A valid 'amount' is required." });
  }

  const query = "SELECT * FROM carbon_savings_factors ORDER BY saved_kg DESC";
  
  db.query(query, (err, actions) => {
    if (err) {
      console.error("Error fetching savings factors:", err);
      return res.status(500).json({ message: "Database error" });
    }

    let suggestedPlan = [];
    let remainingAmount = targetAmount;

    for (const action of actions) {
      const saved_kg = parseFloat(action.saved_kg);
      
      if (remainingAmount >= saved_kg && saved_kg > 0) {
        const quantity = Math.floor(remainingAmount / saved_kg);
        
        suggestedPlan.push({
          description: action.description,
          quantity: quantity,
          total_saved_kg: parseFloat((quantity * saved_kg).toFixed(2)),
          unit: action.unit
        });
        
        remainingAmount -= (quantity * saved_kg);
      }
    }
    
    if (remainingAmount > 0 && suggestedPlan.length === 0 && actions.length > 0) {
       const smallestAction = actions[actions.length - 1];
       suggestedPlan.push({
         description: smallestAction.description,
         quantity: 1,
         total_saved_kg: parseFloat(smallestAction.saved_kg),
         unit: smallestAction.unit
       });
    }

    res.json({
      targetAmount: parseFloat(targetAmount.toFixed(2)),
      suggestedPlan: suggestedPlan
    });
  });
});

module.exports = router;