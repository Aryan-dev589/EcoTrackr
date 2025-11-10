// components/TravelLog.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosconfig'; // Import our central API client

// --- Define constants based on your database ---
const CAR_CATEGORIES = {
  'Mini': 'Mini (e.g., Tata Nano, Alto 800)',
  'Lower medium': 'Lower medium (e.g., Swift, Baleno)',
  'Upper medium': 'Upper medium (e.g., Honda City, Verna)',
  'Luxury': 'Luxury (e.g., Mercedes, BMW)',
  'Sports': 'Sports (e.g., Porsche, Ferrari)',
  'Dual purpose 4x4': 'Dual purpose 4x4 (e.g., Thar, Jimny)',
  'MPV': 'MPV (e.g., Ertiga, Innova)'
};

const CAR_FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'PHEV'];

const MOTORCYCLE_CATEGORIES = {
  'Motorcycle (Small)': 'Small (e.g., 100-125cc)',
  'Motorcycle (Medium)': 'Medium (e.g., 150-250cc)',
  'Motorcycle (Large)': 'Large (e.g., 250cc+)',
  'Motorcycle (Average)': 'Average (default)'
};
// ----------------------------------------------

const TravelLog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startLocation: 'Your Location',
    endLocation: '',
    distance: '',
    useManualDistance: false,
    // --- New state structure ---
    vehicleType: 'car', // This is our top-level selector: 'car' or 'motorcycle'
    categoryName: 'Lower medium', // This will hold the final DB category
    fuelType: 'Petrol' // This will hold the final DB fuel type
  });

  const [emissionResult, setEmissionResult] = useState(null);
  const [error, setError] = useState(null);

  // --- Smarter state handler ---
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };

      // This is the conditional logic you asked for
      if (field === 'vehicleType') {
        if (value === 'car') {
          // Set car defaults
          newState.categoryName = 'Lower medium';
          newState.fuelType = 'Petrol';
        } else if (value === 'motorcycle') {
          // Set motorcycle defaults
          newState.categoryName = 'Motorcycle (Average)';
          newState.fuelType = 'Petrol'; // Motorcycle fuel is fixed to Petrol
        }
      }
      
      return newState;
    });
  };

  // --- NEW Simplified Submit Function ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmissionResult(null);
    setError(null);

    // Get distance (same as before)
    let distance = formData.useManualDistance ? parseFloat(formData.distance) : 20.5;
    if (!distance || distance <= 0) {
      setError("Please enter a valid distance.");
      return;
    }

    // No more translation! The state is already correct.
    const apiPayload = {
      categoryName: formData.categoryName,
      fuelType: formData.fuelType,
      distance: distance
    };

    // Call the API (same as before)
    try {
      console.log("Sending to backend:", apiPayload);
      const response = await api.post('/api/travel/log', apiPayload);

      setEmissionResult(response.data.calculated_emissions_kg);

    } catch (err) {
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
      {/* Header (unchanged) */}
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
            <h1 className="text-xl font-semibold text-gray-900">Log Your Travel</h1>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {emissionResult !== null ? (
          // Success Screen (unchanged)
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Travel Emission Calculated</h2>
            <div className="text-4xl font-extrabold text-green-600 mb-2">
              {emissionResult.toFixed(2)} kg CO₂e
            </div>
            <p className="text-gray-700 mb-6">This is the estimated carbon emission for your trip.</p>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md"
              onClick={() => navigate('/Dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ... Location, Map, and Distance sections are unchanged ... */}
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Location</label>
                    <input type="text" value={formData.startLocation} onChange={(e) => handleInputChange('startLocation', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Your Location" />
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Location</label>
                    <input type="text" value={formData.endLocation} onChange={(e) => handleInputChange('endLocation', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Search address..." />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Route Preview</h3>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <i className="fas fa-map-marked-alt text-3xl mb-2"></i>
                  <p>Map preview will appear here</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                <span className="font-medium text-gray-700">Calculated Distance:</span>
                <span className="text-lg font-semibold text-green-600">20.5 km</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <input type="checkbox" id="manualDistance" checked={formData.useManualDistance} onChange={(e) => handleInputChange('useManualDistance', e.target.checked)} className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                <label htmlFor="manualDistance" className="text-sm font-medium text-gray-700">Or, enter distance manually</label>
              </div>
              {formData.useManualDistance && (
                <div className="flex items-center space-x-2">
                  <input type="number" value={formData.distance} onChange={(e) => handleInputChange('distance', e.target.value)} className="w-32 px-3 py-2 border border-gray-300 rounded-md" placeholder="0" min="0" step="0.1" />
                  <span className="text-gray-600">km</span>
                </div>
              )}
            </div>

            {/* --- NEW, SMARTER VEHICLE DETAILS SECTION --- */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Top-Level Vehicle Type (Car/Motorcycle) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="car">Car</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
                
                {/* 2. Conditional Category Dropdown */}
                {/* This will hold the exact `categoryName` for the API */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.vehicleType === 'car' ? 'Car Category' : 'Motorcycle Category'}
                  </label>
                  
                  {/* Show Car Categories */}
                  {formData.vehicleType === 'car' && (
                    <select
                      value={formData.categoryName}
                      onChange={(e) => handleInputChange('categoryName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {Object.entries(CAR_CATEGORIES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  )}
                  
                  {/* Show Motorcycle Categories */}
                  {formData.vehicleType === 'motorcycle' && (
                    <select
                      value={formData.categoryName}
                      onChange={(e) => handleInputChange('categoryName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {Object.entries(MOTORCYCLE_CATEGORIES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  )}
                </div>

              </div>

              {/* 3. Conditional Fuel Type Dropdown */}
              <div className="mt-4">
                {/* Only show fuel options for Cars */}
                {formData.vehicleType === 'car' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type
                    </label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => handleInputChange('fuelType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {CAR_FUEL_TYPES.map(fuel => (
                        <option key={fuel} value={fuel}>{fuel}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* For Motorcycle, show a disabled input */}
                {formData.vehicleType === 'motorcycle' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type
                    </label>
                    <input
                      type="text"
                      value="Petrol"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                )}
              </div>
            </div>
            {/* --- END OF NEW SECTION --- */}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md"
              >
                Log Travel Emission
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default TravelLog;