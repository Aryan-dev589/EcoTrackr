// src/pages/GlobalCO2.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosconfig';

const GlobalCO2 = () => {
  const navigate = useNavigate();
  const [co2Level, setCo2Level] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/environment/global-co2');
        setCo2Level(response.data.co2);
      } catch (err) {
        console.error("Failed to fetch CO2 data", err);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Determine status (Safe vs Critical)
  const isCritical = co2Level > 350;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Dark themed background for "Global" feel */}
      
      {/* Header */}
      <div className="bg-slate-800 shadow-sm border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/Dashboard')}
              className="flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
            <h1 className="text-xl font-semibold text-white">Global Climate Monitor</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center text-white">Loading global data...</div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-3xl shadow-2xl p-10 border border-slate-700 text-center"
          >
            <h2 className="text-2xl text-slate-400 mb-6 font-light tracking-wide">CURRENT ATMOSPHERIC CO₂</h2>
            
            <div className="flex justify-center items-baseline gap-4 mb-8">
              <span className="text-8xl font-black text-white tracking-tighter">
                {co2Level}
              </span>
              <span className="text-3xl text-slate-400 font-medium">ppm</span>
            </div>

            <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold mb-8 ${
              isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400'
            }`}>
              {isCritical ? '⚠️ CRITICAL LEVEL (Above 350 ppm)' : 'SAFE LEVEL'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-8 pt-8 border-t border-slate-700">
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="text-slate-400 text-sm mb-1">Pre-Industrial Level</div>
                <div className="text-2xl font-bold text-white">~280 ppm</div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="text-slate-400 text-sm mb-1">Safe Upper Limit</div>
                <div className="text-2xl font-bold text-green-400">350 ppm</div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="text-slate-400 text-sm mb-1">Annual Global Emissions</div>
                <div className="text-2xl font-bold text-red-400">~37.4 Gt</div>
              </div>
            </div>
            
            <p className="text-slate-500 text-xs mt-8">
              Data Source: NOAA (Mauna Loa Observatory) via global-warming.org
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GlobalCO2;