// src/pages/PurchaseLog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosconfig'; // Import our central API client

// Corrected database from your screenshot and text
const ITEM_DATABASE = [
  { name: 'iPhone 15 Pro', emission: 66.0000 },
  { name: 'Samsung Galaxy S24', emission: 45.0000 },
  { name: 'Generic Smartphone', emission: 70.0000 },
  { name: 'Macbook Air M3 (15-inch)', emission: 158.0000 },
  { name: 'Standard Laptop', emission: 300.0000 },
  { name: 'Cotton T-Shirt', emission: 7.0000 }, // Corrected to 7.0
  { name: 'Generic Jeans', emission: 33.4000 }
];

const PurchaseLog = () => {
  const navigate = useNavigate();
  
  // --- 1. NEW STATE for the final result ---
  // This will control showing the form vs. the success screen
  const [finalEmission, setFinalEmission] = useState(null);

  const [items, setItems] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

  const [formData, setFormData] = useState({
    itemName: '', 
    quantity: 1,
    estimatedEmission: null
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch items when page loads
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get('/api/purchase/items');
        setItems(response.data); 
        
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            itemName: response.data[0].item_name
          }));
        }
        setIsLoading(false);
        
      } catch (err) {
        console.error("Failed to fetch items", err);
        setApiError("Could not load items from database.");
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []); 

  // Calculate real-time emissions
  useEffect(() => {
    const calculateEmission = () => {
      if (!formData.itemName || items.length === 0) {
        setFormData(prev => ({ ...prev, estimatedEmission: null }));
        return;
      }
      setIsCalculating(true);
      
      const foundItem = items.find(item =>
        item.item_name.toLowerCase() === formData.itemName.toLowerCase()
      );
      
      if (foundItem) {
        const totalEmission = foundItem.emission_factor * formData.quantity;
        setFormData(prev => ({ ...prev, estimatedEmission: totalEmission }));
      } else {
        setFormData(prev => ({ ...prev, estimatedEmission: null }));
      }
      setIsCalculating(false);
    };
    calculateEmission();
  }, [formData.itemName, formData.quantity, items]); 

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- 2. UPDATED handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const apiPayload = {
      itemName: formData.itemName,
      quantity: parseInt(formData.quantity) || 1
    };
    
    try {
      const response = await api.post('/api/purchase/log', apiPayload);
      const realEmissions = response.data.calculated_emissions_kg;
      
      // --- INSTEAD of alert/navigate, we set the final result ---
      setFinalEmission(realEmissions);
      
    } catch (err) {
      if (err.response && err.response.data.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError("Log failed. Please try again.");
      }
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
        <div className="text-white text-2xl font-semibold">
          Loading Items...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
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
            <h1 className="text-xl font-semibold text-gray-900">Log a Purchase</h1>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* --- 3. NEW CONDITIONAL RENDER --- */}
        {finalEmission !== null ? (
          // --- THE NEW SUCCESS SCREEN ---
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Purchase Logged!</h2>
            <div className="text-4xl font-extrabold text-blue-600 mb-2">
              {finalEmission.toFixed(2)} kg CO₂e
            </div>
            <p className="text-gray-700 mb-6">This is the embodied carbon footprint for your item.</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
              onClick={() => navigate('/Dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
          
        ) : (
          
          // --- THE EXISTING FORM ---
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Real-time Emission Display */}
            {formData.estimatedEmission !== null && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Estimated Embodied Carbon</h3>
                    <div className="flex items-baseline space-x-2">
                      {isCalculating ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Calculating...</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-3xl font-bold">{formData.estimatedEmission.toFixed(1)}</span>
                          <span className="text-lg">kg CO₂e</span>
                        </>
                      )}
                    </div>
                    <p className="text-blue-100 text-sm mt-2">
                      This is the manufacturing footprint for your new item
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl">🏭</div>
                  </div>
                </div>
              </div>
            )}

            {/* Item Name Dropdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Item Name *
              </label>
              <select
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.g.target.value)}
                className="block w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {items.map((item) => (
                  <option key={item.item_name} value={item.item_name}>
                    {item.item_name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Select an item from your embodied carbon database.
              </p>
            </div>

            {/* Quantity Input */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantity *
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  min="1"
                  required
                />
                <span className="text-gray-600">items</span>
              </div>
            </div>

            {/* Information Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <i className="fas fa-info-circle text-blue-500 text-lg mt-0.5"></i>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">
                    About Embodied Carbon
                  </h4>
                  <p className="text-sm text-blue-700">
                    This logs the one-time manufacturing footprint for a new item. 
                    Embodied carbon includes emissions from raw material extraction, 
                    manufacturing, and transportation before the item reaches you.
                  </p>
                </div>
              </div>
            </div>

            {/* API Error Display */}
            {apiError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {apiError}
              </div>
            )}

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                type="submit"
                disabled={isCalculating || isLoading}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  !isCalculating && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCalculating ? 'Calculating...' : (
                  `Log Purchase Footprint (${formData.estimatedEmission ? formData.estimatedEmission.toFixed(1) : '0'} kg CO₂e)`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PurchaseLog;