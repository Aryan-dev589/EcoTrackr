
const express = require("express");
const fetch = require("node-fetch");
const db = require("../db"); // Your database connection
const { authenticateToken } = require("../middleware/checkAuth.js");

const router = express.Router();

// --- GLOBAL CO2 ENDPOINT ---
// GET /api/environment/global-co2
router.get("/global-co2", async (req, res) => {
  try {
    // 1. Check cache in DB
    const [cacheRows] = await db.promise().query(
      "SELECT value, last_updated FROM global_stats_cache WHERE stat_key = 'global_co2' AND last_updated > (NOW() - INTERVAL 24 HOUR)"
    );
    if (cacheRows.length > 0) {
      // Cache is fresh
      return res.json({ co2: parseFloat(cacheRows[0].value), last_updated: cacheRows[0].last_updated });
    }

    // 2. Fetch from external API
    const apiUrl = "https://global-warming.org/api/co2-api";
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch global CO2 data");
    const data = await response.json();
    if (!data.co2 || !Array.isArray(data.co2) || data.co2.length === 0) throw new Error("Malformed CO2 API response");
    // Get the most recent ppm value
    const latest = data.co2[data.co2.length - 1];
    const ppm = parseFloat(latest?.trend || latest?.cycle || latest?.mean);
    if (isNaN(ppm)) throw new Error("Could not parse CO2 ppm value");

    // 3. Update cache in DB
    await db.promise().query(
      `INSERT INTO global_stats_cache (stat_key, value, last_updated)
        VALUES ('global_co2', ?, NOW())
        ON DUPLICATE KEY UPDATE value = VALUES(value), last_updated = NOW()`,
      [ppm]
    );

    // 4. Return new value
    res.json({ co2: ppm, last_updated: new Date() });
  } catch (err) {
    console.error("Global CO2 route error:", err.message);
    res.status(500).json({ message: "Error fetching global CO2 data.", error: err.message });
  }
});

// --- THIS IS OUR "REQUEST LOCK" ---
// This in-memory map will prevent a "thundering herd" of 1000s
// of requests from hitting the external API all at once.
// It will only store the cities *currently* being fetched.
const fetchLocks = new Map();

// Helper function to pause "follower" requests
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get AQI quality from its value
function getAqiQuality(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

// --- Our new "Smart Caching" AQI Endpoint ---
router.get("/aqi", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  let city = req.query.city; // For the "Search" feature

  try {
    // --- 1. Get the City ---
    if (!city) {
      // If no search city is provided, get the user's *default* city
      const [userRows] = await db.promise().query("SELECT city FROM users WHERE user_id = ?", [userId]);
      if (userRows.length === 0 || !userRows[0].city) {
        return res.status(400).json({ message: "No city found on your profile. Please update your profile or search for a city." });
      }
      city = userRows[0].city;
    }

    const cityKey = city.toLowerCase().trim();

    // --- 2. Check Our Cache First ---
    // We check for a "fresh" record (less than 3 hours old)
    const cacheQuery = "SELECT * FROM aqi_cache WHERE city_name = ? AND last_updated > (NOW() - INTERVAL 3 HOUR)";
    const [cacheRows] = await db.promise().query(cacheQuery, [cityKey]);

    if (cacheRows.length > 0) {
      // --- 2a. Cache is FRESH. Send it immediately. ---
      return res.json(cacheRows[0]);
    }

    // --- 2b. Cache is STALE or MISSING. We must fetch new data. ---
    
    // --- 3. Implement the "Request Lock" ---
    if (fetchLocks.has(cityKey)) {
      // A "leader" is already fetching data for this city!
      // We will wait a few seconds for the leader to finish.
      await sleep(3000); // Wait 3 seconds
      
      // Now, check the cache again. The leader should have updated it.
      const [retryRows] = await db.promise().query(cacheQuery, [cityKey]);
      if (retryRows.length > 0) {
        return res.json(retryRows[0]);
      }
      // If it's still not in the cache, something went wrong.
      return res.status(500).json({ message: "Failed to retrieve cached data after lock." });
    }

    // --- 4. This is the "LEADER" Request ---
    try {
      // Set the lock
      fetchLocks.set(cityKey, true);

      // --- 5. Call the External API ---
      const apiKey = process.env.AQI_API_KEY;
      if (!apiKey) {
        throw new Error("AQI_API_KEY is not set in .env file");
      }
      
      const externalUrl = `https://api.waqi.info/feed/${cityKey}/?token=${apiKey}`;
      const waqiResponse = await fetch(externalUrl);
      const waqiData = await waqiResponse.json();

      if (waqiData.status !== "ok") {
        throw new Error(`WAQI API error for city "${cityKey}": ${waqiData.data}`);
      }

      // --- 6. Process the New Data ---
      const aqi = waqiData.data.aqi;
      const quality = getAqiQuality(aqi);
      const stationName = waqiData.data.city.name;

      const aqiResult = {
        city_name: cityKey,
        aqi: aqi,
        quality: quality,
        station_name: stationName,
        last_updated: new Date()
      };

      // --- 7. Save to our Cache ---
      // This SQL command will INSERT a new row, or UPDATE an existing one
      const updateCacheQuery = `
        INSERT INTO aqi_cache (city_name, aqi, quality, station_name, last_updated)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          aqi = VALUES(aqi),
          quality = VALUES(quality),
          station_name = VALUES(station_name),
          last_updated = NOW();
      `;
      await db.promise().query(updateCacheQuery, [cityKey, aqi, quality, stationName]);

      // --- 8. Send the new data to the user ---
      res.json(aqiResult);

    } finally {
      // --- 9. Release the Lock ---
      // No matter what happens (success or error), we MUST release the lock.
      fetchLocks.delete(cityKey);
    }

  } catch (err) {
    console.error("AQI route error:", err.message);
    res.status(500).json({ message: "Error fetching AQI data.", error: err.message });
  }
});

module.exports = router;