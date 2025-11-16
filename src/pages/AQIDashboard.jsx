// src/pages/AQIDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosconfig'; // Use our central API client

// Helper function to get the Tailwind CSS colors for the AQI card
// These are based on standard AQI color codes
const getAqiColors = (quality) => {
  if (quality === "Good") return 'bg-gradient-to-br from-green-500 to-green-400';
  if (quality === "Moderate") return 'bg-gradient-to-br from-yellow-500 to-yellow-400';
  if (quality === "Unhealthy for Sensitive Groups") return 'bg-gradient-to-br from-orange-500 to-orange-400';
  if (quality === "Unhealthy") return 'bg-gradient-to-br from-red-500 to-red-400';
  if (quality === "Very Unhealthy") return 'bg-gradient-to-br from-purple-500 to-purple-400';
  if (quality === "Hazardous") return 'bg-gradient-to-br from-fuchsia-900 to-fuchsia-800';
  return 'bg-gradient-to-br from-gray-500 to-gray-400';
};

const AQIDashboard = () => {
  const navigate = useNavigate();
  const [aqiData, setAqiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');

  // This function fetches AQI data, either for the default city or a searched city
  const fetchAqi = async (city = null) => {
    setIsLoading(true);
    setError(null);
    setAqiData(null); // Clear previous data
    
    // Determine the API URL
    const url = city 
      ? `/api/environment/aqi?city=${city}` // Search URL
      : '/api/environment/aqi'; // Default (profile) URL

    try {
      const response = await api.get(url);
      setAqiData(response.data);
    } catch (err) {
      console.error("Failed to fetch AQI data", err);
      // Use the error message from our backend
      setError(err.response?.data?.message || "Could not load AQI data. Please try again.");
    }
    setIsLoading(false);
  };

  // 1. Fetch the user's default city AQI on page load
  useEffect(() => {
    fetchAqi(); // Call with no city to get the default
  }, []); // The [] means this runs once on load

  // 2. Handle the search bar submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchCity.trim()) return;
    fetchAqi(searchCity); // Call with the search term
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/Dashboard')} // Navigate back to main Dashboard
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Live Air Quality Index (AQI)</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Search Bar (The "Hybrid" feature) */}
          <form onSubmit={handleSearch} className="bg-white/90 rounded-3xl shadow-lg p-6 flex gap-4">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Check another city... (e.g., Delhi, Mumbai)"
              className="flex-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
          
          {/* AQI Display Card */}
          <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-gray-200">
            {isLoading && (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {error && (
              <div className="flex justify-center items-center h-48 text-center text-red-600">
                <i className="fas fa-exclamation-triangle mr-3"></i>
                {error}
              </div>
            )}
            
            {aqiData && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Left Side - Data */}
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-sm text-gray-500">Live data for:</p>
                    <h2 className="text-3xl font-bold text-gray-800 capitalize mb-4">
                      {/* Show the city name from the API result */}
                      {aqiData.city_name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">Main monitoring station:</p>
                    <p className="text-md font-semibold text-gray-700">{aqiData.station_name}</p>
                    <p className="text-xs text-gray-400 mt-4">
                      {/* Show the timestamp from our cache */}
                      Last Updated: {new Date(aqiData.last_updated).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {/* Right Side - The "Donut" */}
                  <div className={`flex-shrink-0 w-48 h-48 rounded-full ${getAqiColors(aqiData.quality)} flex items-center justify-center shadow-xl`}>
                    <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center text-gray-800">
                      <div className="text-5xl font-extrabold">{aqiData.aqi}</div>
                      <div className="text-md font-semibold">{aqiData.quality}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AQIDashboard;