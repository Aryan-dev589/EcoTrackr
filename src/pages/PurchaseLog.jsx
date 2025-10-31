// src/pages/PurchaseLog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PurchaseLog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 1,
    category: '',
    estimatedEmission: null
  });

  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Mock database of items with embodied carbon factors (kg CO2e per item)
  const itemDatabase = [
    { name: 'Smartphone', category: 'electronics', emission: 55 },
    { name: 'Laptop', category: 'electronics', emission: 300 },
    { name: 'T-Shirt', category: 'clothing', emission: 8 },
    { name: 'Jeans', category: 'clothing', emission: 25 },
    { name: 'Sneakers', category: 'footwear', emission: 15 },
    { name: 'Coffee Mug', category: 'household', emission: 1.5 },
    { name: 'Book', category: 'media', emission: 2.5 },
    { name: 'Water Bottle', category: 'household', emission: 3 },
    { name: 'Backpack', category: 'accessories', emission: 12 },
    { name: 'Headphones', category: 'electronics', emission: 20 },
    { name: 'Tablet', category: 'electronics', emission: 120 },
    { name: 'Winter Jacket', category: 'clothing', emission: 35 },
    { name: 'Desk Lamp', category: 'furniture', emission: 18 },
    { name: 'Notebook', category: 'stationery', emission: 1 },
    { name: 'Pen', category: 'stationery', emission: 0.1 }
  ];

  // Search items when user types
  useEffect(() => {
    if (formData.itemName.length > 1) {
      const results = itemDatabase.filter(item =>
        item.name.toLowerCase().includes(formData.itemName.toLowerCase())
      );
      setSearchResults(results.slice(0, 5)); // Show top 5 results
      setShowSuggestions(true);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [formData.itemName]);

  // Calculate emissions when item or quantity changes
  useEffect(() => {
    calculateEmission();
  }, [formData.itemName, formData.quantity]);

  const calculateEmission = () => {
    if (!formData.itemName.trim()) {
      setFormData(prev => ({ ...prev, estimatedEmission: null }));
      return;
    }

    setIsCalculating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const foundItem = itemDatabase.find(item =>
        item.name.toLowerCase() === formData.itemName.toLowerCase()
      );
      
      if (foundItem) {
        const totalEmission = foundItem.emission * formData.quantity;
        setFormData(prev => ({ 
          ...prev, 
          estimatedEmission: totalEmission,
          category: foundItem.category
        }));
      } else {
        // Default emission for unknown items
        const defaultEmission = 10 * formData.quantity; // 10kg CO2e as default
        setFormData(prev => ({ 
          ...prev, 
          estimatedEmission: defaultEmission,
          category: 'other'
        }));
      }
      setIsCalculating(false);
    }, 300);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemSelect = (item) => {
    setFormData(prev => ({
      ...prev,
      itemName: item.name,
      category: item.category
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemName.trim()) {
      alert('Please enter an item name');
      return;
    }

    // Here you would typically send the data to your backend
    const logData = {
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    console.log('Purchase log data:', logData);
    alert(`Purchase logged successfully! Embodied carbon: ${formData.estimatedEmission} kg CO₂e`);
    navigate('/dashboard');
  };

  const popularItems = [
    { name: 'Smartphone', icon: '📱', emission: '55 kg' },
    { name: 'T-Shirt', icon: '👕', emission: '8 kg' },
    { name: 'Laptop', icon: '💻', emission: '300 kg' },
    { name: 'Jeans', icon: '👖', emission: '25 kg' }
  ];

  return (
  <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Log a Purchase</h1>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
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

          {/* Item Name Search */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Item Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search Smartphone, T-Shirt, Laptop..."
                required
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleItemSelect(item)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-sm text-gray-500 capitalize">{item.category}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        ~{item.emission} kg CO₂e per item
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Queries embodied carbon factors database
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

          {/* Popular Items Quick Select */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Items</h3>
            <p className="text-sm text-gray-600 mb-3">Quick select common purchases</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularItems.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    handleInputChange('itemName', item.name);
                    handleInputChange('quantity', 1);
                  }}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-2xl mb-2">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700 text-center">{item.name}</span>
                  <span className="text-xs text-gray-500 mt-1">{item.emission}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Breakdown (if item is found) */}
          {formData.category && formData.estimatedEmission && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category Details</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-sm text-gray-600 capitalize">{formData.category}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Per Item:</span>
                  <span className="ml-2 text-sm text-gray-600">
                    {itemDatabase.find(item => item.name.toLowerCase() === formData.itemName.toLowerCase())?.emission || '10'} kg CO₂e
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              disabled={!formData.itemName.trim() || isCalculating}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formData.itemName.trim() && !isCalculating
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isCalculating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </div>
              ) : (
                `Log Purchase Footprint (${formData.estimatedEmission ? formData.estimatedEmission.toFixed(1) : '0'} kg CO₂e)`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseLog;