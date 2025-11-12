// server.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const db = require("./db");  // ✅ Import DB connection

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/debug", (req, res) => {
  console.log("--- DEBUG ROUTE HIT ---");
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);
  console.log("-----------------------");
  res.json({
    message: "Debug route received your request!",
    headersReceived: req.headers,
    bodyReceived: req.body,
  });
});
// -----------------------------------------------------------------



// ✅ ROUTES START HERE

// test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});



const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const travelRoutes = require("./routes/travel");
app.use("/api/travel", travelRoutes);

const foodRoutes = require("./routes/food");
app.use("/api/food", foodRoutes);

const purchaseRoutes = require("./routes/purchase");
app.use("/api/purchase", purchaseRoutes);

const deviceRoutes = require("./routes/device");
app.use("/api/device", deviceRoutes);

const energyRoutes = require("./routes/energy");
app.use("/api/energy", energyRoutes);

const dashboardRoutes = require("./routes/dashboard");
app.use("/api/dashboard", dashboardRoutes);


// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
