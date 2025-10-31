// components/Dashboard.jsx
import React, { useState } from 'react';
import TravelLog from './TravelLog';
import FoodLog from './FoodLog';
import PurchaseLog from './PurchaseLog';
import EnergyLog from './EnergyLog';
import AICoach from './AI';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  // view: 'dashboard' | 'travel' | 'food' | 'purchase' | 'energy' | 'ai'
  const [view, setView] = useState('dashboard');

  // Sample data for charts
  const emissionData = [
    { name: 'Travel', value: 40 },
    { name: 'Food', value: 25 },
    { name: 'Shopping', value: 20 },
    { name: 'Energy', value: 15 },
  ];

  const trendData = [
    { date: 'Jan', emissions: 45 },
    { date: 'Feb', emissions: 52 },
    { date: 'Mar', emissions: 48 },
    { date: 'Apr', emissions: 38 },
    { date: 'May', emissions: 42 },
    { date: 'Jun', emissions: 35 },
    { date: 'Jul', emissions: 28 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen relative pb-20 overflow-x-hidden flex" style={{
      background: 'linear-gradient(135deg, #e6f4f1 0%, #ecfdf5 50%, #e0f2f1 100%)',
    }}>
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gradient-to-b from-green-700 via-emerald-600 to-green-400 shadow-2xl z-20 py-8 px-4 gap-2 border-r border-green-200">
        <nav className="flex flex-col gap-2 mt-2">
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
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-green-50 hover:bg-emerald-400/30 transition">
            <span className="text-xl">🏆</span> Gamification
          </button>
        </nav>
        <div className="flex-1"></div>
        {/* Optionally, add a logo or leaf at the bottom */}
        <div className="flex justify-center mt-8">
          <i className="fas fa-leaf text-emerald-200 text-3xl opacity-60"></i>
        </div>
      </aside>
      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Subtle leafy SVG overlays */}
        <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0" style={{
          background: "url('data:image/svg+xml;utf8,<svg width='180' height='180' viewBox='0 0 180 180' fill='none' xmlns='http://www.w3.org/2000/svg'><ellipse cx='90' cy='90' rx='80' ry='30' fill='%2310b981' fill-opacity='0.07'/><ellipse cx='40' cy='140' rx='40' ry='15' fill='%2395e6b3' fill-opacity='0.08'/><ellipse cx='150' cy='50' rx='30' ry='12' fill='%2322d3ee' fill-opacity='0.07'/></svg>') repeat, url('data:image/svg+xml;utf8,<svg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'><ellipse cx='60' cy='60' rx='50' ry='20' fill='%2395e6b3' fill-opacity='0.08'/><ellipse cx='30' cy='90' rx='30' ry='10' fill='%2310b981' fill-opacity='0.06'/><ellipse cx='100' cy='30' rx='20' ry='8' fill='%2322d3ee' fill-opacity='0.07'/></svg>') repeat"
        }} />
        {/* Floating leaf icon for extra green feeling */}
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
        {view === 'travel' ? (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <TravelLog />
          </div>
        ) : view === 'food' ? (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <FoodLog />
          </div>
        ) : view === 'purchase' ? (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <PurchaseLog />
          </div>
        ) : view === 'energy' ? (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <EnergyLog />
          </div>
        ) : view === 'ai' ? (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <AICoach />
          </div>
        ) : (
          <motion.div
            className="max-w-4xl mx-auto px-4 py-6 space-y-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}>
            {/* Today's & Monthly Footprint Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Today's Carbon Footprint */}
              <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-green-100 ring-2 ring-green-100 ring-opacity-40 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700">Today's Carbon Footprint</h2>
                    <p className="text-sm text-gray-500">As of {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Compared to yesterday</div>
                    <div className="text-green-600 text-sm font-medium">↓ 12% lower</div>
                  </div>
                </div>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-green-600 mb-2">10.5</div>
                  <div className="text-gray-600">kg CO₂e</div>
                </div>
              </div>
              {/* Monthly Carbon Footprint */}
              <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-emerald-100 ring-2 ring-emerald-100 ring-opacity-40 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700">Monthly Carbon Footprint</h2>
                    <p className="text-sm text-gray-500">For {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Compared to last month</div>
                    <div className="text-emerald-600 text-sm font-medium">↓ 6% lower</div>
                  </div>
                </div>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-emerald-600 mb-2">412</div>
                  <div className="text-gray-600">kg CO₂e</div>
                </div>
              </div>
            </div>
            {/* Emission Breakdown Pie Chart & Trend Bar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="bg-white/90 rounded-3xl shadow-lg p-6 border border-green-100 flex flex-col items-center">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Monthly Emission Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={emissionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emissionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Bar Chart */}
              <div className="bg-white/90 rounded-3xl shadow-lg p-6 border border-green-100 flex flex-col items-center">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Emission Trend (Monthly)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="emissions" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* ML Forecast Card */}
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
            {/* AQI Card */}
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
            {/* Recent Activities Card */}
            <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-green-100 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <i className="fas fa-history text-emerald-400"></i> Recent Activities
              </h3>
              <ul className="divide-y divide-green-50">
                <li className="py-2 flex items-center gap-3">
                  <span className="text-emerald-500"><i className="fas fa-bus"></i></span>
                  <span className="flex-1">Commute to work (Bus)</span>
                  <span className="text-xs text-gray-400">7:45 AM</span>
                </li>
                <li className="py-2 flex items-center gap-3">
                  <span className="text-emerald-500"><i className="fas fa-shopping-cart"></i></span>
                  <span className="flex-1">Grocery shopping</span>
                  <span className="text-xs text-gray-400">6:10 PM</span>
                </li>
                <li className="py-2 flex items-center gap-3">
                  <span className="text-emerald-500"><i className="fas fa-utensils"></i></span>
                  <span className="flex-1">Lunch (Vegetarian)</span>
                  <span className="text-xs text-gray-400">1:00 PM</span>
                </li>
                <li className="py-2 flex items-center gap-3">
                  <span className="text-emerald-500"><i className="fas fa-bolt"></i></span>
                  <span className="flex-1">Turned off lights</span>
                  <span className="text-xs text-gray-400">8:30 AM</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;