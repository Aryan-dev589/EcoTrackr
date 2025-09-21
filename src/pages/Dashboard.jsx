// src/pages/Dashboard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [userName] = useState("Aryan"); // later we’ll fetch actual user data

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          Welcome back, {userName} 🌱
        </h1>

        {/* ✅ Profile button with link */}
        <Link
          to="/profile"
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          Profile
        </Link>
      </header>

      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Carbon Footprint */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Today’s Carbon Footprint
          </h2>
          <p className="text-4xl font-bold text-green-700">12.4 kg CO₂</p>
          <p className="text-gray-500 mt-1">Compared to yesterday: 🔼 2%</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-center space-y-4">
          <button className="w-full bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700 transition">
            ➕ Add Activity
          </button>
          <button className="w-full bg-green-500 text-white py-3 rounded-lg shadow hover:bg-green-600 transition">
            📊 View Analytics
          </button>
        </div>
      </div>

      {/* Placeholder for Charts */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Weekly Trends</h2>
        <div className="h-40 flex items-center justify-center text-gray-400">
          📈 Chart will go here
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
