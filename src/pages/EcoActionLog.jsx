// src/pages/EcoActionLog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosconfig'; // Use our central API client

// --- 1. NEW: Badge Modal Component ---
const BadgeModal = ({ badges, onClose }) => {
  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className="text-3xl font-bold text-yellow-500 mb-4">Achievement Unlocked!</h2>
        <p className="text-lg text-gray-700 mb-6">You've earned {badges.length} new badge(s)!</p>
        
        <div className="space-y-4 mb-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border">
              <i className={`${badge.icon_class || 'fas fa-medal'} text-4xl`}></i>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">{badge.title}</h4>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full"
          onClick={onClose}
        >
          Awesome!
        </button>
      </motion.div>
    </div>
  );
};


// --- 2. Main EcoActionLog Component ---
const EcoActionLog = () => {
  const navigate = useNavigate();
  
  // State for the form
  const [factors, setFactors] = useState([]); // Holds actions from DB
  const [selectedActionId, setSelectedActionId] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // State for UI control
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalSavings, setFinalSavings] = useState(null); // For success screen
  
  // --- 3. NEW: State for the Badge Modal ---
  const [earnedBadges, setEarnedBadges] = useState([]);

  // 1. Fetch all available eco-actions
  useEffect(() => {
    const fetchFactors = async () => {
      try {
        const response = await api.get('/api/eco-actions/factors');
        setFactors(response.data);
        if (response.data.length > 0) {
          setSelectedActionId(response.data[0].action_id);
        }
      } catch (err) {
        console.error("Failed to fetch eco-actions", err);
        setError("Could not load actions. Please try again.");
      }
      setIsLoading(false);
    };
    fetchFactors();
  }, []); // The [] means this runs once on load

  // 2. Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedActionId || !quantity || quantity <= 0) {
      setError("Please select an action and enter a valid quantity.");
      return;
    }

    const apiPayload = {
      action_id: parseInt(selectedActionId),
      quantity: parseFloat(quantity)
    };

    try {
      console.log("Sending eco-action log:", apiPayload);
      const response = await api.post('/api/eco-actions/log', apiPayload);

      // --- 4. UPGRADED: Handle the response ---
      // a. Set the savings for the success screen
      setFinalSavings(response.data.total_saved_kg);
      
      // b. Set the new badges to trigger the modal
      if (response.data.newBadgesEarned && response.data.newBadgesEarned.length > 0) {
        setEarnedBadges(response.data.newBadgesEarned);
      }

    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error(err);
    }
  };
  
  // Helper to show the unit for the selected action
  const getSelectedUnit = () => {
    if (!selectedActionId) return 'units';
    const selectedAction = factors.find(f => f.action_id === parseInt(selectedActionId));
    return selectedAction ? selectedAction.unit : 'units';
  }

  // --- 5. NEW: Function to close the modal and go to dashboard ---
  const handleCloseModalAndNavigate = () => {
    setEarnedBadges([]);
    navigate('/Dashboard');
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
      
      {/* --- 6. NEW: Render the Badge Modal if badges were earned --- */}
      {earnedBadges.length > 0 && (
        <BadgeModal badges={earnedBadges} onClose={handleCloseModalAndNavigate} />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/Dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Log Eco-Friendly Action</h1>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {finalSavings !== null ? (
          // --- 7. SUCCESS SCREEN (This shows *under* the modal) ---
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-green-700 mb-4">Great Job!</h2>
            <p className="text-gray-700 mb-2">You've successfully logged your action and saved an estimated:</p>
            <div className="text-4xl font-extrabold text-green-600 mb-6">
              {finalSavings.toFixed(2)} kg CO₂e
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
              onClick={() => navigate('/Dashboard')} // This button is a fallback
            >
              Back to Dashboard
            </button>
          </motion.div>

        ) : (
          // --- 8. THE FORM ---
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Action Selection Dropdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-lg font-medium text-gray-900 mb-3">
                Select an Action
              </label>
              {isLoading ? (
                <div className="w-full p-3 border rounded-lg bg-gray-100 animate-pulse">Loading actions...</div>
              ) : (
                <select
                  value={selectedActionId}
                  onChange={(e) => setSelectedActionId(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="" disabled>-- Select an action --</option>
                  {factors.map((action) => (
                    <option key={action.action_id} value={action.action_id}>
                      {action.description} (saves ~{action.saved_kg} kg/{action.unit})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity Input */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-lg font-medium text-gray-900 mb-3">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-32 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g., 1"
                />
                <span className="text-lg text-gray-700">{getSelectedUnit()}</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition-colors"
              >
                {isLoading ? "Loading..." : "Log My Action!"}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default EcoActionLog;