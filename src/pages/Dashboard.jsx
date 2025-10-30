// components/Dashboard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');

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
      background: 'radial-gradient(ellipse at 60% 0%, #d1fae5 0%, #f0fdf4 60%, #e0f7ef 100%)',
    }}>
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gradient-to-b from-green-700 via-emerald-600 to-green-400 shadow-2xl z-20 py-8 px-4 gap-2 border-r border-green-200">
        <nav className="flex flex-col gap-2 mt-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-white bg-emerald-500/80 shadow-inner ring-2 ring-white/20 focus:outline-none">
            <span className="text-xl">🏠</span> Dashboard
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-green-50 hover:bg-emerald-400/30 transition">
            <span className="text-xl">🚗</span> Travel Log
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-green-50 hover:bg-emerald-400/30 transition">
            <span className="text-xl">🍔</span> Food Log
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-green-50 hover:bg-emerald-400/30 transition">
            <span className="text-xl">🛍️</span> Purchase Log
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-green-50 hover:bg-emerald-400/30 transition">
            <span className="text-xl">⚡</span> Energy Log
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-green-50 hover:bg-emerald-400/30 transition">
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
        <motion.div
          className="max-w-4xl mx-auto px-4 py-6 space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}>
          {/* Today's Footprint */}
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
              <div className="text-5xl font-bold text-green-600 mb-2">18.2</div>
              <div className="text-gray-600">kg CO₂e</div>
            </div>
          </div>

          {/* AQI and Forecast Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AQI Widget */}
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl shadow p-6 border border-green-200 ring-2 ring-emerald-100 ring-opacity-30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Air Quality Index</h3>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-map-marker-alt text-gray-400"></i>
                  <span className="text-sm text-gray-600">Karnataka</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">42</div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Good
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Updated 2h ago</div>
                  <div className="text-xs text-gray-500">Healthy air quality</div>
                </div>
              </div>
            </div>

            {/* Predictive Forecast */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white border border-emerald-300 ring-2 ring-green-300 ring-opacity-30">
              <h3 className="text-lg font-semibold mb-3">Monthly Forecast</h3>
              <div className="text-2xl font-bold mb-2">250 kg CO₂e</div>
              <p className="text-green-100 mb-4">
                Your forecast for next month. You are on track to beat it!
              </p>
              <div className="flex items-center space-x-2">
                <i className="fas fa-trophy"></i>
                <span className="text-sm">15% better than average</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-green-100 ring-2 ring-green-100 ring-opacity-40 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-700">Emission Analytics</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeRange('weekly')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    timeRange === 'weekly'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeRange('monthly')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    timeRange === 'monthly'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Pie Chart - Emission Breakdown */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-4 text-center">
                  Emission Breakdown
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emissionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {emissionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart - Trend */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-4 text-center">
                  Emission Trend ({timeRange === 'weekly' ? 'Weekly' : 'Monthly'})
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="emissions" fill="#10B981" name="Carbon Emissions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow p-5 text-center border border-green-100 ring-2 ring-green-100 ring-opacity-30">
              <div className="text-2xl font-bold text-green-600 mb-1">4.2</div>
              <div className="text-sm text-gray-600">Travel kg</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">3.8</div>
              <div className="text-sm text-gray-600">Food kg</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">2.1</div>
              <div className="text-sm text-gray-600">Shopping kg</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-purple-500 mb-1">1.5</div>
              <div className="text-sm text-gray-600">Energy kg</div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {[
                { type: 'travel', activity: 'Commute to work', co2: '2.4 kg', time: '2h ago' },
                { type: 'food', activity: 'Lunch - Veg meal', co2: '1.2 kg', time: '4h ago' },
                { type: 'shopping', activity: 'Grocery shopping', co2: '3.1 kg', time: '1d ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-green-50 hover:bg-green-50 rounded-xl transition">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'travel' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'food' ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <i className={`fas ${
                        activity.type === 'travel' ? 'fa-car' :
                        activity.type === 'food' ? 'fa-utensils' : 'fa-shopping-bag'
                      } text-sm`}></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{activity.activity}</div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{activity.co2}</div>
                    <div className="text-sm text-gray-500">CO₂e</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;