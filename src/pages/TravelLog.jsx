// components/TravelLog.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

 const TravelLog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startLocation: 'Your Location',
    endLocation: '',
    distance: '',
    useManualDistance: false,
    vehicleType: 'car',
    carSize: 'medium',
    fuelType: 'petrol'
  });
  const [emissionResult, setEmissionResult] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Travel log data:', formData);
    // Calculate emissions (simple mock calculation)
    let distance = formData.useManualDistance && formData.distance ? parseFloat(formData.distance) : 20.5;
    let factor = 0.18; // default factor per km
    if (formData.vehicleType === 'car') factor = 0.18;
    else if (formData.vehicleType === 'motorcycle') factor = 0.09;
    else if (formData.vehicleType === 'bus') factor = 0.05;
    else if (formData.vehicleType === 'train') factor = 0.04;
    else if (formData.vehicleType === 'flight') factor = 0.25;
    else if (formData.vehicleType === 'bicycle' || formData.vehicleType === 'walking') factor = 0;
    // Add a little variation for fuel type
    if (formData.fuelType === 'electric') factor *= 0.5;
    if (formData.fuelType === 'diesel') factor *= 1.1;
    if (formData.fuelType === 'cng') factor *= 0.8;
    if (formData.fuelType === 'hybrid') factor *= 0.7;
    // Calculate emission
    const emission = +(distance * factor).toFixed(2);
    setEmissionResult(emission);
    // Optionally, save to backend here
  };

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
            <h1 className="text-xl font-semibold text-gray-900">Log Your Travel</h1>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {emissionResult !== null ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Travel Emission Calculated</h2>
            <div className="text-4xl font-extrabold text-green-600 mb-2">{emissionResult} kg CO₂e</div>
            <p className="text-gray-700 mb-6">This is the estimated carbon emission for your trip.</p>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Inputs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {/* Start Location */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Location
                  </label>
                  <input
                    type="text"
                    value={formData.startLocation}
                    onChange={(e) => handleInputChange('startLocation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your Location"
                  />
                </div>
              </div>

              {/* End Location */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Location
                  </label>
                  <input
                    type="text"
                    value={formData.endLocation}
                    onChange={(e) => handleInputChange('endLocation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Search address..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Map Preview Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Route Preview</h3>
            
            {/* Map Placeholder */}
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <i className="fas fa-map-marked-alt text-3xl mb-2"></i>
                <p>Map preview will appear here</p>
                <p className="text-sm">Google Maps integration</p>
              </div>
            </div>
            
            {/* Distance Display */}
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
              <span className="font-medium text-gray-700">Calculated Distance:</span>
              <span className="text-lg font-semibold text-green-600">20.5 km</span>
            </div>
          </div>

          {/* Manual Distance Input */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="manualDistance"
                checked={formData.useManualDistance}
                onChange={(e) => handleInputChange('useManualDistance', e.target.checked)}
                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="manualDistance" className="text-sm font-medium text-gray-700">
                Or, enter distance manually
              </label>
            </div>
            
            {formData.useManualDistance && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.distance}
                  onChange={(e) => handleInputChange('distance', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="text-gray-600">km</span>
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="walking">Walking</option>
                  <option value="flight">Flight</option>
                </select>
              </div>

              {/* Car Size (only show for cars) */}
              {formData.vehicleType === 'car' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Size
                  </label>
                  <select
                    value={formData.carSize}
                    onChange={(e) => handleInputChange('carSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="suv">SUV</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
              )}

              {/* Fuel Type (show for car, motorcycle, bus, train, flight) */}
              {['car', 'motorcycle', 'bus', 'train', 'flight'].includes(formData.vehicleType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {/* Car and motorcycle options */}
                    {['car', 'motorcycle'].includes(formData.vehicleType) && <>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="cng">CNG</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </>}
                    {/* Bus options */}
                    {formData.vehicleType === 'bus' && <>
                      <option value="diesel">Diesel</option>
                      <option value="cng">CNG</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </>}
                    {/* Train options */}
                    {formData.vehicleType === 'train' && <>
                      <option value="electric">Electric</option>
                      <option value="diesel">Diesel</option>
                    </>}
                    {/* Flight options */}
                    {formData.vehicleType === 'flight' && <>
                      <option value="jet-fuel">Jet Fuel</option>
                      <option value="biofuel">Biofuel</option>
                    </>}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
