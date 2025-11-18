// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import TravelLog from './TravelLog';
import FoodLog from './FoodLog';
import PurchaseLog from './PurchaseLog';
import EnergyLog from './EnergyLog';
import AICoach from './AI';
import EcoActionLog from './EcoActionLog'; 
import AQIDashboard from './AQIDashboard';
import BadgesPage from './BadgesPage';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../api/axiosconfig'; 

// --- Data & Colors for Charts ---
const COLORS = ['#059669', '#F97316', '#3B82F6', '#F59E0B']; // Green, Orange, Blue, Amber
const CATEGORY_NAMES = {
  travel: 'Travel',
  food: 'Food',
  purchase: 'Shopping', 
  energy: 'Energy'
};

// --- Loading Component (for a nice UI) ---
const DashboardLoading = () => (
  <motion.div
    className="max-w-4xl mx-auto px-4 py-6 space-y-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="bg-white/90 rounded-3xl shadow-lg p-8 h-48 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white/90 rounded-3xl shadow-lg p-8 h-48 animate-pulse"></div>
      <div className="bg-white/90 rounded-3xl shadow-lg p-8 h-48 animate-pulse"></div>
    </div>
  </motion.div>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [view, setView] = useState('dashboard');

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch REAL data
  useEffect(() => {
    if (view === 'dashboard') {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const today = new Date();
          const userTodayISO = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
                                .toISOString()
                                .split('T')[0];
          const response = await api.get(`/api/dashboard/data?today=${userTodayISO}`);
          setDashboardData(response.data);
        } catch (err) {
          console.error("Failed to fetch dashboard data", err);
          setError("Could not load dashboard data. Please try again.");
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [view]); 

  // PREPARE DATA for charts *from state*
  const pieChartData = dashboardData ? 
    Object.entries(dashboardData.monthlyBreakdown)
      .map(([key, value]) => ({
        name: CATEGORY_NAMES[key] || key,
        value: value
      }))
      .filter(entry => entry.value > 0)
    : []; 

  const barChartData = dashboardData ? dashboardData.monthlyTrend : [];

  // --- Main Render ---
  return (
    <div className="min-h-screen relative pb-20 overflow-x-hidden flex" style={{
      background: 'linear-gradient(135deg, #e6f4f1 0%, #ecfdf5 50%, #e0f2f1 100%)',
    }}>
      {/* Sidebar Navigation (Unchanged) */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gradient-to-b from-green-700 via-emerald-600 to-green-400 shadow-2xl z-20 py-8 px-4 gap-2 border-r border-green-200">
        <nav className="flex flex-col gap-2 mt-2">
          
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold ${view === 'dashboard' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('dashboard')}
          >
            <span className="text-xl">🏠</span> Dashboard
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'ecoAction' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('ecoAction')}
          >
            <span className="text-xl">🌱</span> Log Eco-Action
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'travel' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('travel')}
          >
            <span className="text-xl">🚗</span> Travel Log
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'food' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('food')}
          >
            <span className="text-xl">🍔</span> Food Log
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'purchase' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('purchase')}
          >
            <span className="text-xl">🛍️</span> Purchase Log
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'energy' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('energy')}
          >
            <span className="text-xl">⚡</span> Energy Log
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'ai' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('ai')}
          >
            <span className="text-xl">🤖</span> AI Coach
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'aqi' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('aqi')}
          >
            <span className="text-xl">💨</span> AQI Dashboard
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'badges' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('badges')}
          >
            <span className="text-xl">🏆</span> Badges & Achievements
          </button>
        </nav>
        <div className="flex-1"></div>
        <div className="flex justify-center mt-8">
          <i className="fas fa-leaf text-emerald-200 text-3xl opacity-60"></i>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* ... (background styles) ... */}
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg rounded-b-3xl">
          <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between items-center">
            <div className="flex flex-col items-center md:items-start">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-2 flex items-center gap-2">
                <span className="inline-block"><i className="fas fa-leaf"></i></span> EcoTrackr Dashboard
              </h1>
              <p className="text-green-100 text-lg">Track and reduce your environmental impact</p>
            </div>
            <a href="/profile" className="mt-4 md:mt-0 bg-white/90 text-green-700 font-semibold px-5 py-2 rounded-full shadow hover:bg-green-100 transition flex items-center gap-2">
              <i className="fas fa-user-circle"></i> Profile
            </a>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          
          {/* This logic correctly switches views */}
          {view === 'travel' ? (
            <TravelLog />
          ) : view === 'food' ? (
            <FoodLog />
          ) : view === 'purchase' ? (
            <PurchaseLog />
          ) : view === 'energy' ? (
            <EnergyLog />
          ) : view === 'ai' ? (
            <AICoach />
          ) : view === 'aqi' ? ( 
            <AQIDashboard /> 
          ) : view === 'ecoAction' ? ( 
            <EcoActionLog /> 
          ) : view === 'badges' ? ( 
            <BadgesPage />
          ) : (
            
            // --- This is the main dashboard view ---
            
            isLoading ? (
              <DashboardLoading />
            ) : error ? (
              <div className="bg-red-100 text-red-700 rounded-xl p-6 shadow text-center font-semibold">
                {error}
              </div>
            ) : dashboardData && ( 
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                
                {/* --- 1. YOUR LAYOUT: Today's Card (Full Width) --- */}
                <div className="grid grid-cols-1 gap-8 mb-8">
                  <div className="bg-white/90 rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-emerald-700 mb-2">Today's Emissions</h2>
                    <div className="text-5xl font-extrabold text-emerald-500 mb-2">
                      {dashboardData.todayTotal}
                      <span className="text-lg font-medium text-emerald-400 ml-2">kg CO₂</span>
                    </div>
                    {/* TodaySaved is no longer displayed here, as requested */}
                  </div>
                </div>

                {/* --- 2. YOUR LAYOUT: Monthly Cards (Side-by-Side) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Monthly Total Emissions Card */}
                  <div className="bg-white/90 rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-emerald-700 mb-2">Monthly Emissions</h2>
                    <div className="text-5xl font-extrabold text-emerald-500 mb-2">
                      {dashboardData.monthlyTotal}
                      <span className="text-lg font-medium text-emerald-400 ml-2">kg CO₂</span>
                    </div>
                    <div className="text-emerald-700/70 text-sm">
                      For {new Date().toLocaleString('default', { month: 'long' })}
                    </div>
                  </div>
                  
                  {/* --- 3. YOUR NEW CARD: Monthly Carbon Saved --- */}
                  <div className="bg-white/90 rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center border-2 border-green-300">
                    <h2 className="text-2xl font-bold text-green-700 mb-2">Monthly Carbon Saved</h2>
                    <div className="text-5xl font-extrabold text-green-600 mb-2">
                      {dashboardData.monthlySaved}
                      <span className="text-lg font-medium text-green-500 ml-2">kg CO₂</span>
                    </div>
                    <div className="text-green-700/70 text-sm">
                      Keep up the great work!
                    </div>
                  </div>
                </div>

                {/* --- (Rest of the dashboard is unchanged) --- */}

                {/* Hotspot Card */}
                <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-green-100">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Monthly Snapshot</h2>
                  {dashboardData.monthlyTotal > 0 ? (
                    <div className="text-center">
                      <p className="text-lg text-gray-600">Your biggest impact this month is from</p>
                      <p className="text-4xl font-bold text-green-600 my-2">{dashboardData.hotspot.category}</p>
                      <p className="text-lg text-gray-600">making up <span className="font-bold">{dashboardData.hotspot.percentage}%</span> of your monthly total.</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-lg text-gray-600">Log your first activity to see your monthly snapshot!</p>
                    </div>
                  )}
                </div>

                {/* Pie Chart & Bar Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pie Chart Card */}
                  <div className="bg-white/90 rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-emerald-700 mb-4">Monthly Breakdown</h2>
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            label
                          >
                            {pieChartData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} kg CO₂e`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[180px] flex items-center justify-center text-gray-500">
                        Log data to see your breakdown.
                      </div>
                    )}
                  </div>

                  {/* Bar Chart: Monthly Trend */}
                  <div className="bg-white/90 rounded-3xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-emerald-700 mb-4">Monthly Emission Trend</h2>
                    {barChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `${value} kg CO₂e`} />
                          <Legend />
                          <Bar dataKey="total" fill="#059669" name="Total Emissions" maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-gray-500">
                        Log data for a few months to see your trend.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* High and Low Impact Logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* High-Impact Logs */}
                  <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-red-100">
                    <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                      <i className="fas fa-arrow-trend-up"></i> This Month's High-Impact Logs
                    </h3>
                    <ul className="divide-y divide-red-100">
                      {dashboardData.highImpactLogs.length > 0 ? (
                        dashboardData.highImpactLogs.map((log, index) => (
                          <li key={index} className="py-3 flex justify-between items-center">
                            <span className="text-gray-700">{log.name}</span>
                            <span className="font-bold text-red-600">{log.emissions.toFixed(1)} kg</span>
                          </li>
                        ))
                      ) : (
                        <li className="py-3 text-gray-500">No high-impact logs yet.</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Low-Carbon Wins */}
                  <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-green-100">
                    <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                      <i className="fas fa-leaf"></i> This Month's Low-Carbon Wins
                    </h3>
                    <ul className="divide-y divide-green-100">
                      {dashboardData.lowImpactLogs.length > 0 ? (
                        dashboardData.lowImpactLogs.map((log, index) => (
                          <li key={index} className="py-3 flex justify-between items-center">
                            <span className="text-gray-700">{log.name}</span>
                            <span className="font-bold text-green-600">{log.emissions.toFixed(1)} kg</span>
                          </li>
                        ))
                      ) : (
                        <li className="py-3 text-gray-500">Keep logging to see your wins!</li>
                      )}
                    </ul>
                  </div>
                </div>
                
                {/* Other Dummy Cards (ML, AQI) */}
                <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-green-100 flex flex-col md:flex-row items-center gap-6">
                   {/* ... (ML Forecast card) ... */}
                 </div>
                 <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-blue-100 flex flex-col md:flex-row items-center gap-6 mb-8">
                   {/* ... (AQI card) ... */}
                 </div>
              </motion.div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;