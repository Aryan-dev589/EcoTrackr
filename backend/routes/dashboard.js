// backend/routes/dashboard.js
const express = require("express");
const db = require("../db"); // Your database connection
const { authenticateToken } = require("../middleware/checkAuth.js");

const router = express.Router();

// Helper function to get the start of the current month in YYYY-MM-DD format
function getFirstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

router.get("/data", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const firstDayOfMonthISO = getFirstDayOfMonth();

  // 1. Get the user's "today" date from the query parameter
  const userTodayISO = req.query.today; 
  if (!userTodayISO) {
    return res.status(400).json({ message: "Missing 'today' date parameter." });
  }

  // --- 1. DEFINE ALL SQL QUERIES ---

  // --- Emission Queries (Existing) ---
  const todayQuery = `
    SELECT SUM(total_emissions) as todayTotal
    FROM (
      (SELECT total_emissions FROM travel_logs WHERE user_id = ? AND DATE(log_date) = ?)
      UNION ALL
      (SELECT total_emissions FROM food_logs WHERE user_id = ? AND DATE(log_date) = ?)
      UNION ALL
      (SELECT total_emissions FROM purchase_logs WHERE user_id = ? AND DATE(log_date) = ?)
      UNION ALL
      (SELECT total_emissions FROM device_usage_logs WHERE user_id = ? AND DATE(log_date) = ?)
    ) as today_logs;
  `;
  const todayParams = [userId, userTodayISO, userId, userTodayISO, userId, userTodayISO, userId, userTodayISO];

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

  const energyQuery = `(SELECT SUM(total_emissions) as energyTotal FROM monthly_energy_logs WHERE user_id = ? AND billing_end_date >= ?)`;
  const energyParams = [userId, firstDayOfMonthISO];
  
  const deviceEnergyQuery = `SELECT SUM(total_emissions) as energyTotal FROM device_usage_logs WHERE user_id = ? AND log_date >= ?`;
  const deviceEnergyParams = [userId, firstDayOfMonthISO];

  const trendQuery = `
    SELECT DATE_FORMAT(log_date, '%Y-%m') as month, SUM(total_emissions) as total
    FROM (
      (SELECT total_emissions, log_date FROM travel_logs WHERE user_id = ?)
      UNION ALL
      (SELECT total_emissions, log_date FROM food_logs WHERE user_id = ?)
      UNION ALL
      (SELECT total_emissions, log_date FROM purchase_logs WHERE user_id = ?)
      UNION ALL
      (SELECT total_emissions, log_date FROM device_usage_logs WHERE user_id = ? AND 
        NOT EXISTS (SELECT 1 FROM monthly_energy_logs WHERE user_id = ? AND DATE_FORMAT(device_usage_logs.log_date, '%Y-%m') = DATE_FORMAT(monthly_energy_logs.billing_end_date, '%Y-%m'))
      )
      UNION ALL
      (SELECT total_emissions, billing_end_date as log_date FROM monthly_energy_logs WHERE user_id = ?)
    ) as all_logs
    WHERE log_date IS NOT NULL GROUP BY month ORDER BY month DESC LIMIT 6;
  `;
  const trendParams = [userId, userId, userId, userId, userId, userId];

  const allLogsQuery = `
    (SELECT l.total_emissions, v.category_name as name FROM travel_logs l JOIN vehicle_emission_factors v ON l.vehicle_factor_id = v.factor_id WHERE l.user_id = ? AND l.log_date >= ?)
    UNION ALL
    (SELECT l.total_emissions, f.food_name as name FROM food_logs l JOIN food_emission_factors f ON l.food_factor_id = f.factor_id WHERE l.user_id = ? AND l.log_date >= ?)
    UNION ALL
    (SELECT l.total_emissions, i.item_name as name FROM purchase_logs l JOIN item_embodied_factors i ON l.item_factor_id = i.factor_id WHERE l.user_id = ? AND l.log_date >= ?)
    UNION ALL
    (SELECT l.total_emissions, d.device_name as name FROM device_usage_logs l JOIN device_consumption_factors d ON l.device_factor_id = d.factor_id WHERE l.user_id = ? AND l.log_date >= ?)
    ORDER BY total_emissions DESC;
  `;
  const allLogsParams = [userId, firstDayOfMonthISO, userId, firstDayOfMonthISO, userId, firstDayOfMonthISO, userId, firstDayOfMonthISO];

  // --- NEW SAVINGS QUERIES (FOR PHASE 4) ---
  const todaySavedQuery = `
    SELECT SUM(total_saved_kg) as todaySaved
    FROM eco_action_logs
    WHERE user_id = ? AND DATE(log_date) = ?
  `;
  const todaySavedParams = [userId, userTodayISO];

  const monthlySavedQuery = `
    SELECT SUM(total_saved_kg) as monthlySaved
    FROM eco_action_logs
    WHERE user_id = ? AND log_date >= ?
  `;
  const monthlySavedParams = [userId, firstDayOfMonthISO];


  // --- 2. CREATE ALL PROMISES ---
  const pToday = new Promise((resolve, reject) => db.query(todayQuery, todayParams, (err, r) => err ? reject(err) : resolve(r)));
  const pBreakdown = new Promise((resolve, reject) => db.query(breakdownQuery, breakdownParams, (err, r) => err ? reject(err) : resolve(r)));
  const pEnergy = new Promise((resolve, reject) => db.query(energyQuery, energyParams, (err, r) => err ? reject(err) : resolve(r)));
  const pDeviceEnergy = new Promise((resolve, reject) => db.query(deviceEnergyQuery, deviceEnergyParams, (err, r) => err ? reject(err) : resolve(r)));
  const pTrend = new Promise((resolve, reject) => db.query(trendQuery, trendParams, (err, r) => err ? reject(err) : resolve(r)));
  const pAllLogs = new Promise((resolve, reject) => db.query(allLogsQuery, allLogsParams, (err, r) => err ? reject(err) : resolve(r)));
  
  // --- NEW PROMISES ---
  const pTodaySaved = new Promise((resolve, reject) => db.query(todaySavedQuery, todaySavedParams, (err, r) => err ? reject(err) : resolve(r)));
  const pMonthlySaved = new Promise((resolve, reject) => db.query(monthlySavedQuery, monthlySavedParams, (err, r) => err ? reject(err) : resolve(r)));


  // --- 3. RUN ALL QUERIES IN PARALLEL ---
  Promise.all([
    pToday, pBreakdown, pEnergy, pDeviceEnergy, pTrend, pAllLogs, 
    pTodaySaved, pMonthlySaved // <-- ADDED NEW PROMISES
  ])
    .then(([
      todayResult, breakdownResult, energyResult, deviceEnergyResult, trendResult, allLogsResult,
      todaySavedResult, monthlySavedResult // <-- ADDED NEW RESULTS
    ]) => {

      // --- 4. PROCESS ALL DATA ---
      
      // Emissions Data (Existing)
      const todayTotal = parseFloat(todayResult[0].todayTotal) || 0;
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

      const trendData = trendResult.reverse().map(row => ({
        name: new Date(row.month + '-02').toLocaleString('default', { month: 'short' }),
        total: parseFloat(row.total)
      }));

      let hotspot = { category: 'None', value: 0 };
      if (monthlyTotal > 0) {
        for (const [category, value] of Object.entries(monthlyBreakdown)) {
          if (value > hotspot.value) {
            hotspot.category = category;
            hotspot.value = value;
          }
        }
      }
      const hotspotCategory = hotspot.category.charAt(0).toUpperCase() + hotspot.category.slice(1);
      
      const highImpactLogs = allLogsResult.slice(0, 3).map(log => ({
        name: log.name,
        emissions: parseFloat(log.total_emissions)
      }));
      const lowImpactLogs = allLogsResult.length > 3 ?
        allLogsResult.slice(-3).reverse().map(log => ({
          name: log.name,
          emissions: parseFloat(log.total_emissions)
        })) 
        : [];
      
      // --- NEW SAVINGS DATA ---
      const todaySaved = parseFloat(todaySavedResult[0].todaySaved) || 0;
      const monthlySaved = parseFloat(monthlySavedResult[0].monthlySaved) || 0;

      // --- 5. SEND THE FINAL UPGRADED JSON OBJECT ---
      res.json({
        // Existing Data
        todayTotal: parseFloat(todayTotal.toFixed(1)),
        monthlyTotal: parseFloat(monthlyTotal.toFixed(1)),
        monthlyBreakdown: {
          travel: parseFloat(monthlyBreakdown.travel.toFixed(1)),
          food: parseFloat(monthlyBreakdown.food.toFixed(1)),
          purchase: parseFloat(monthlyBreakdown.purchase.toFixed(1)),
          energy: parseFloat(monthlyBreakdown.energy.toFixed(1)),
        },
        monthlyTrend: trendData,
        hotspot: {
          category: hotspotCategory,
          percentage: (monthlyTotal > 0 ? (hotspot.value / monthlyTotal) * 100 : 0).toFixed(0)
        },
        highImpactLogs: highImpactLogs,
        lowImpactLogs: lowImpactLogs,
        
        // --- NEW DATA ---
        todaySaved: parseFloat(todaySaved.toFixed(1)),
        monthlySaved: parseFloat(monthlySaved.toFixed(1))
      });
      
    })
    .catch(err => {
      // --- THE ERROR RESPONSE ---
      console.error("Dashboard data error:", err);
      res.status(500).json({ message: "Error fetching dashboard data" });
    });
});

module.exports = router;