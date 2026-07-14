// backend/db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",   // or your DB host
  user: "root",        // your DB username
  password: "YOUR_MySQL_DB_PASSWORD",        // your DB password
  database: "carbon_tracker" // change to your DB name
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Database connected!");
});

module.exports = db;
