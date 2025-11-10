// src/pages/FoodLog.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosconfig'; // Import our central API client

// --- 1. Define constants based on your food_emission_factors table ---
const FOOD_ITEMS = [
  'Poultry Meat',
  'Beef (Beef Herd)',
  'Milk (Dairy)',
  'Eggs',
  'Rice',
  'Lamb & Mutton',
  'Cheese',
  'Chocolate',
  'Coffee',
  'Prawns',
  'Pig meat',
  'Fish',
  'Root vegetables',
  'Wheat & rye',
  'Bananas',
  'Apples'
];
// ------------------------------------------------------------------

const FoodLog = () => {
  const navigate = useNavigate();
  
  // --- 2. Simplified state to match the backend ---
  const [formData, setFormData] = useState({
    foodName: FOOD_ITEMS[0], // Default to the first item
    quantity: 100,
    unit: 'grams'
  });

  const [emissionResult, setEmissionResult] = useState(null);
  const [error, setError] = useState(null); // For API errors

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- 3. NEW handleSubmit function connected to the backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEmissionResult(null);

    // --- A. Convert user's quantity to KG (which API needs) ---
    let quantityInKg;
    const formQuantity = parseFloat(formData.quantity);

    if (formData.unit === 'grams') {
      quantityInKg = formQuantity / 1000;
    } else if (formData.unit === 'kg') {
      quantityInKg = formQuantity;
    } else {
      setError("Unsupported unit. Please use 'grams' or 'kg'.");
      return;
    }

    if (!formQuantity || formQuantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    // --- B. Create the API payload ---
    const apiPayload = {
      foodName: formData.foodName,
      quantity: quantityInKg
    };

    // --- C. Call the API ---
    try {
      console.log("Sending to backend:", apiPayload);
      const response = await api.post('/api/food/log', apiPayload);

      // Success! Set the *real* emission result
      setEmissionResult(response.data.calculated_emissions_kg);

    } catch (err) {
      // Handle errors from the backend
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
      {/* Header (Unchanged) */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/Dashboard')} // Changed to /Dashboard
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Log Your Food</h1>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {emissionResult !== null ? (
          // --- 4. SUCCESS SCREEN (Shows REAL data) ---
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Food Emission Calculated</h2>
            <div className="text-4xl font-extrabold text-green-600 mb-2">
              {emissionResult.toFixed(3)} kg CO₂e
            </div>
            <p className="text-gray-700 mb-6">This is the estimated carbon emission for this item.</p>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md"
              onClick={() => navigate('/Dashboard')} // Changed to /Dashboard
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          // --- 5. NEW, SIMPLIFIED FORM ---
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Food Item Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-lg font-medium text-gray-900 mb-3">
                Select Food Item
              </label>
              <select
                value={formData.foodName}
                onChange={(e) => handleInputChange('foodName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {FOOD_ITEMS.map((food) => (
                  <option key={food} value={food}>{food}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Select the single food item you want to log.
              </p>
            </div>

            {/* Quantity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-lg font-medium text-gray-900 mb-3">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g., 200"
                />
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="grams">Grams</option>
                  <option value="kg">Kilograms</option>
                </select>
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
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Log Food Emission
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FoodLog;