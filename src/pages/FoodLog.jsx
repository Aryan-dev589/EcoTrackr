// src/pages/FoodLog.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FoodLog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mealType: 'breakfast',
    dietType: 'veg',
    mealDescription: '',
    ingredients: [],
    quantity: 1,
    unit: 'serving',
    image: null,
    useImageRecognition: false
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [emissionResult, setEmissionResult] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Food log data:', formData);
    // Calculate emissions (simple mock calculation)
    let base = 0.5; // default per serving
    if (formData.dietType === 'veg') base = 0.5;
    else if (formData.dietType === 'vegan') base = 0.4;
    else if (formData.dietType === 'non-veg') base = 1.8;
    // Add a little for meal type
    if (formData.mealType === 'snack' || formData.mealType === 'beverage') base *= 0.5;
    // Calculate emission
    const emission = +(base * parseFloat(formData.quantity || 1)).toFixed(2);
    setEmissionResult(emission);
    // Optionally, save to backend here
  };

  const mealOptions = [
    { value: 'breakfast', label: 'Breakfast', icon: '🥞' },
    { value: 'lunch', label: 'Lunch', icon: '🍲' },
    { value: 'dinner', label: 'Dinner', icon: '🍽️' },
    { value: 'snack', label: 'Snack', icon: '🍎' },
    { value: 'beverage', label: 'Beverage', icon: '☕' }
  ];

  const dietOptions = [
    { value: 'veg', label: 'Vegetarian', color: 'bg-green-100 text-green-800' },
    { value: 'non-veg', label: 'Non-Vegetarian', color: 'bg-red-100 text-red-800' },
    { value: 'vegan', label: 'Vegan', color: 'bg-emerald-100 text-emerald-800' }
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
            <h1 className="text-xl font-semibold text-gray-900">Log Your Meal</h1>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {emissionResult !== null ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Food Emission Calculated</h2>
            <div className="text-4xl font-extrabold text-green-600 mb-2">{emissionResult} kg CO₂e</div>
            <p className="text-gray-700 mb-6">This is the estimated carbon emission for your meal.</p>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meal Type Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Meal Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {mealOptions.map((meal) => (
                <button
                  key={meal.value}
                  type="button"
                  onClick={() => handleInputChange('mealType', meal.value)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    formData.mealType === meal.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1">{meal.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{meal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Diet Type Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Diet Type</h3>
            <div className="flex space-x-3">
              {dietOptions.map((diet) => (
                <button
                  key={diet.value}
                  type="button"
                  onClick={() => handleInputChange('dietType', diet.value)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    formData.dietType === diet.value
                      ? `${diet.color} border-current`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {diet.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Meal Description
            </label>
            <textarea
              value={formData.mealDescription}
              onChange={(e) => handleInputChange('mealDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe your meal (e.g., 'Rice with vegetables and lentils')"
              rows="3"
            />
            <p className="text-sm text-gray-500 mt-2">
              Be specific for accurate carbon footprint calculation
            </p>
          </div>

          {/* Quantity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0.1"
                step="0.1"
              />
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="serving">Serving</option>
                <option value="grams">Grams</option>
                <option value="kg">Kilograms</option>
                <option value="pieces">Pieces</option>
                <option value="cups">Cups</option>
              </select>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Food Image</h3>
              <span className="text-sm text-gray-500">Optional</span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="useImageRecognition"
                checked={formData.useImageRecognition}
                onChange={(e) => handleInputChange('useImageRecognition', e.target.checked)}
                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="useImageRecognition" className="text-sm font-medium text-gray-700">
                Use AI image recognition to identify food items
              </label>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Food preview" 
                    className="mx-auto h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      handleInputChange('image', null);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div>
                  <i className="fas fa-camera text-3xl text-gray-400 mb-3"></i>
                  <p className="text-gray-600 mb-2">Upload a photo of your meal</p>
                  <label className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md cursor-pointer hover:bg-green-700 transition-colors">
                    <i className="fas fa-upload mr-2"></i>
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {formData.useImageRecognition && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <div className="flex items-center text-blue-700">
                  <i className="fas fa-robot mr-2"></i>
                  <span className="text-sm font-medium">AI Recognition Active</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Our AI will analyze your image and suggest meal details automatically
                </p>
              </div>
            )}
          </div>

          {/* Common Food Items (Quick Select) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Common Food Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { name: 'Rice', icon: '🍚' },
                { name: 'Chapati', icon: '🫓' },
                { name: 'Dal', icon: '🥣' },
                { name: 'Vegetables', icon: '🥗' },
                { name: 'Chicken', icon: '🍗' },
                { name: 'Fish', icon: '🐟' },
                { name: 'Eggs', icon: '🥚' },
                { name: 'Fruits', icon: '🍎' }
              ].map((food) => (
                <button
                  key={food.name}
                  type="button"
                  onClick={() => handleInputChange('mealDescription', food.name)}
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <span className="text-2xl mb-1">{food.icon}</span>
                  <span className="text-sm text-gray-700">{food.name}</span>
                </button>
              ))}
            </div>
          </div>

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