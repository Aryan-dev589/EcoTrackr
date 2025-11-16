// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import TravelLog from './TravelLog';
import FoodLog from './FoodLog';
import PurchaseLog from './PurchaseLog';
import EnergyLog from './EnergyLog';
import AICoach from './AI';
import AQIDashboard from './AQIDashboard';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../api/axiosconfig'; // Your API client

// --- Data & Colors for Charts ---
const COLORS = ['#059669', '#F97316', '#3B82F6', '#F59E0B']; // Green, Orange, Blue, Amber
// Map backend keys to frontend names
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white/90 rounded-3xl shadow-lg p-8 h-48 animate-pulse"></div>
      <div className="bg-white/90 rounded-3xl shadow-lg p-8 h-48 animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white/90 rounded-3xl shadow-lg p-6 h-80 animate-pulse"></div>
      <div className="bg-white/90 rounded-3xl shadow-lg p-6 h-80 animate-pulse"></div>
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
  
  // --- 4. UPDATED useEffect to fetch REAL data (with TIMEZONE FIX) ---
  useEffect(() => {
    if (view === 'dashboard') {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // --- THIS IS THE FINAL TIMEZONE FIX ---
          // 1. Get the user's local "today" date
          const today = new Date();
          // 2. Format it into a 'YYYY-MM-DD' string *manually*
          const year = today.getFullYear();
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const day = today.getDate().toString().padStart(2, '0');
          const userTodayISO = `${year}-${month}-${day}`;
          
          // 3. Send that correct local date to the backend
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
  }, [view]); // Re-runs when you come back to the dashboard

  // --- 5. PREPARE DATA for charts *from state* ---
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
          {/* ... (all your sidebar buttons) ... */}
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold ${view === 'dashboard' ? 'text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-emerald-400/30'} focus:outline-none`}
            onClick={() => setView('dashboard')}
          >
            <span className="text-xl">🏠</span> Dashboard
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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'aqi' ? 'text-white bg-blue-500/80 shadow-inner ring-2 ring-white/20' : 'text-green-50 hover:bg-blue-400/30'} focus:outline-none`}
            onClick={() => setView('aqi')}
          >
            <span className="text-xl">🌫️</span> AQI
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-green-50 hover:bg-emerald-400/30 transition">
            <span className="text-xl">🏆</span> Gamification
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
        <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0" style={{
          background: "url('data:image/svg+xml;utf8,<svg width='180' height='180' viewBox='0 0 180 180' fill='none' xmlns='http://www.w3.org/2000/svg'><ellipse cx='90' cy='90' rx='80' ry='30' fill='%2310b981' fill-opacity='0.07'/><ellipse cx='40' cy='140' rx='40' ry='15' fill='%2395e6b3' fill-opacity='0.08'/><ellipse cx='150' cy='50' rx='30' ry='12' fill='%2322d3ee' fill-opacity='0.07'/></svg>') repeat, url('data:image/svg+xml;utf8,<svg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'><ellipse cx='60' cy='60' rx='50' ry='20' fill='%2395e6b3' fill-opacity='0.08'/><ellipse cx='30' cy='90' rx='30' ry='10' fill='%2310b981' fill-opacity='0.06'/><ellipse cx='100' cy='30' rx='20' ry='8' fill='%2322d3ee' fill-opacity='0.07'/></svg>') repeat"
        }} />
        <div className="hidden md:block absolute right-10 top-10 z-10 animate-bounce-slow">
          <i className="fas fa-leaf text-emerald-400 text-7xl opacity-30 drop-shadow-lg"></i>
        </div>
        
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
                {/* Top Cards: Today & Monthly */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Today's Total Emissions Card */}
                  <div className="bg-white/90 rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-emerald-700 mb-2">Today's Emissions</h2>
                    <div className="text-5xl font-extrabold text-emerald-500 mb-2">
                      {dashboardData.todayTotal}
                      <span className="text-lg font-medium text-emerald-400 ml-2">kg CO₂</span>
                    </div>
                    <div className="text-emerald-700/70 text-sm">Keep it up! 🌱</div>
                  </div>

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
                </div>

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
                   <div className="flex-1">
                     <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                       <i className="fas fa-robot text-emerald-400"></i> ML Forecast
                     </h3>
                     <p className="text-gray-600 mb-2">Our AI predicts your carbon footprint for next month based on your current habits:</p>
                     <div className="text-3xl font-bold text-emerald-600">16.7 kg CO₂e</div>
                     <div className="text-gray-500 text-sm">(Projected: -8% improvement)</div>
                   </div>
                   <div className="flex-1 flex justify-center items-center">
                     <img src="https://cdn-icons-png.flaticon.com/512/2917/2917995.png" alt="Forecast" className="w-24 h-24 opacity-80" />
                   </div>
                 </div>
                 <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-blue-100 flex flex-col md:flex-row items-center gap-6 mb-8">
                   <div className="flex-1">
                     <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
                       <i className="fas fa-wind text-blue-400"></i> Air Quality Index (AQI)
                     </h3>
                     <div className="flex flex-col gap-2 mb-2">
                       <div className="flex items-center gap-4">
                         <span className="text-2xl font-bold text-blue-600">State (Karnataka):</span>
                         <span className="text-2xl font-bold text-blue-600">65</span>
                         <span className="text-blue-500 text-md">Moderate</span>
                       </div>
                       <div className="flex items-center gap-4">
                         <span className="text-2xl font-bold text-blue-600">City (Bangalore):</span>
                         <span className="text-2xl font-bold text-blue-600">77</span>
                         <span className="text-blue-500 text-md">Moderate</span>
                       </div>
                     </div>
                     <div className="text-gray-500 text-sm">State: <span className="font-semibold text-blue-700">Karnataka</span> | City: <span className="font-semibold text-blue-700">Bangalore</span></div>
                     <div className="text-gray-400 text-xs mt-1">Last updated: {new Date().toLocaleTimeString()}</div>
                   </div>
                   <div className="flex-1 flex justify-center items-center">
                     <img src="https://cdn-icons-png.flaticon.com/512/728/728093.png" alt="AQI" className="w-20 h-20 opacity-80" />
                   </div>
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