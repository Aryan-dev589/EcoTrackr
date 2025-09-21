// server.js
const express = require("express");
const cors = require("cors");
const db = require("./db");  // ✅ Import DB connection

const app = express();
app.use(cors());
app.use(express.json());



// ✅ ROUTES START HERE

// test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});



const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const travelRoutes = require("./routes/travel");
app.use("/api/travel", travelRoutes);


// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
