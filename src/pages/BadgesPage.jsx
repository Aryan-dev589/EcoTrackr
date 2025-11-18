// src/pages/BadgesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosconfig'; // Use our central API client

// This is the component for a single badge
const BadgeCard = ({ badge }) => {
  const isEarned = badge.isEarned;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.random() * 0.5 }} // Staggered load
      className={`
        bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center
        transition-all duration-300
        ${isEarned ? 'border-2 border-green-500' : 'opacity-50 grayscale'}
      `}
    >
      <div className="text-6xl mb-4">
        <i className={`${badge.icon_class || 'fas fa-medal'} ${isEarned ? '' : 'text-gray-400'}`}></i>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{badge.title}</h3>
      <p className="text-sm text-gray-600 mb-4 flex-1">{badge.description}</p>
      {isEarned && (
        <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
          ACHIEVED!
        </div>
      )}
    </motion.div>
  );
};

// This is the main page component
const BadgesPage = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        // Call our new backend endpoint
        const response = await api.get('/api/gamification/badges');
        setBadges(response.data);
      } catch (err) {
        console.error("Failed to fetch badges", err);
        setError("Could not load your badges. Please try again.");
      }
      setIsLoading(false);
    };
    fetchBadges();
  }, []); // Runs once on load

  const earnedCount = badges.filter(b => b.isEarned).length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/Dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Badges & Achievements</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center text-white py-10">Loading badges...</div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 rounded-xl p-6 text-center font-semibold">
            {error}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-white/90 rounded-3xl shadow-lg p-6 text-center">
              <h2 className="text-3xl font-bold text-green-700">Your Trophy Case</h2>
              <p className="text-lg text-gray-600 mt-2">
                You have earned <span className="font-bold text-green-600">{earnedCount}</span> out of <span className="font-bold">{badges.length}</span> total badges.
              </p>
            </div>
            
            {/* Grid of Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <BadgeCard key={badge.badge_id} badge={badge} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BadgesPage;