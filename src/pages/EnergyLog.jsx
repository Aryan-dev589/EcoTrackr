// src/pages/EnergyLog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosconfig'; // 1. Import our central API client

const EnergyLog = () => {
  const navigate = useNavigate();
  const [logType, setLogType] = useState('device'); // 'device' or 'bill'
  
  // --- 2. NEW State for REAL data ---
  const [devices, setDevices] = useState([]); // To store devices from DB
  const [isLoading, setIsLoading] = useState(true); // For loading devices
  const [apiError, setApiError] = useState(null); // For submit errors
  const [finalEmission, setFinalEmission] = useState(null); // For success screen

  const [formData, setFormData] = useState({
    // Device logging fields
    deviceName: '', // Will be set after devices load
    duration: '',
    durationUnit: 'hours',
    
    // Bill logging fields
    electricityUsed: '',
    energyUnit: 'kWh', // 'kWh', 'MWh', or 'units'
    startDate: '',
    endDate: '',
  });

  // --- 3. NEW useEffect to fetch devices from your NEW backend route ---
  useEffect(() => {
    // Only fetch devices if we're on the device tab
    if (logType === 'device') {
      setIsLoading(true);
      const fetchDevices = async () => {
        try {
          const response = await api.get('/api/device/devices');
          setDevices(response.data);
          
          if (response.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              deviceName: response.data[0].device_name
            }));
          }
          setIsLoading(false);
        } catch (err) {
          console.error("Failed to fetch devices", err);
          setApiError("Could not load devices from database.");
          setIsLoading(false);
        }
      };
      fetchDevices();
    }
  }, [logType]); // Re-run this if the user switches log types

  // --- 4. REMOVED mock 'userDevices' and mock 'calculateEmission' useEffect ---

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- 5. THE NEW, CONNECTED handleSubmit function ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setFinalEmission(null);

    try {
      let response; // To store the result from either API

      // --- BRANCH 1: User is logging a DEVICE ---
      if (logType === 'device') {
        if (!formData.deviceName || !formData.duration) {
          setApiError('Please select a device and enter duration');
          return;
        }

        // Convert duration to hours (which backend needs)
        let durationHours = parseFloat(formData.duration);
        if (formData.durationUnit === 'minutes') {
          durationHours = durationHours / 60;
        }

        const devicePayload = {
          deviceName: formData.deviceName,
          usageDuration: durationHours
        };
        
        console.log("Sending to /api/device/log:", devicePayload);
        response = await api.post('/api/device/log', devicePayload);

      // --- BRANCH 2: User is logging a BILL ---
      } else if (logType === 'bill') {
        if (!formData.electricityUsed) {
          setApiError('Please enter electricity usage');
          return;
        }

        // Convert all units to kWh (which backend needs)
        let kwh = parseFloat(formData.electricityUsed);
        if (formData.energyUnit === 'MWh') {
          kwh = kwh * 1000;
        }
        // 'units' is usually 1-to-1 with kWh, so we treat it the same

        const billPayload = {
          kwhConsumed: kwh,
          billingStartDate: formData.startDate || null,
          billingEndDate: formData.endDate || null
        };
        
        console.log("Sending to /api/energy/log:", billPayload);
        response = await api.post('/api/energy/log', billPayload);
      }

      // --- SUCCESS ---
      // Both routes return the same JSON shape, so this works for both
      setFinalEmission(response.data.calculated_emissions_kg);

    } catch (err) {
      if (err.response && err.response.data.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError("An error occurred. Please try again.");
      }
      console.error(err);
    }
  };
  
  // (Auto-set dates effect is unchanged)
  useEffect(() => {
    if (logType === 'bill') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      setFormData(prev => ({
        ...prev,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [logType]);


  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
      {/* Header (Unchanged) */}
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
            <h1 className="text-xl font-semibold text-gray-900">Log Energy Use</h1>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* --- 6. NEW SUCCESS SCREEN --- */}
        {finalEmission !== null ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">Energy Log Saved!</h2>
            <div className="text-4xl font-extrabold text-purple-600 mb-2">
              {finalEmission.toFixed(2)} kg CO₂e
            </div>
            <p className="text-gray-700 mb-6">
              {logType === 'device' ? 'Emissions from your device usage.' : 'Emissions from your monthly bill.'}
            </p>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-md"
              onClick={() => navigate('/Dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
        
        // --- 7. YOUR EXISTING FORM (NOW CONNECTED) ---
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Real-time Display REMOVED (too complex, requires fetching grid factor) */}

          {/* Log Type Toggle (Unchanged) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Log Type
            </label>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setLogType('device')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                  logType === 'device'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By Device/Appliance
              </button>
              <button
                type="button"
                onClick={() => setLogType('bill')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                  logType === 'bill'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly Bill
              </button>
            </div>
          </div>

          {/* --- 8. UPDATED Device Logging Form --- */}
          {logType === 'device' && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Device / Appliance *
                </label>
                <select
                  value={formData.deviceName}
                  onChange={(e) => handleInputChange('deviceName', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <option>Loading devices...</option>
                  ) : (
                    devices.map((device) => (
                      <option key={device.device_name} value={device.device_name}>
                        {device.device_name} ({(device.consumption_rate * 1000).toFixed(0)}W)
                      </option>
                    ))
                  )}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Lists all devices from your database.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Duration of Use *
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    required
                  />
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => handleInputChange('durationUnit', e.target.value)}
                    className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Number of {formData.durationUnit} the device was used
                </p>
              </div>
            </>
          )}

          {/* --- 9. UPDATED Monthly Bill Logging Form --- */}
          {logType === 'bill' && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Total Electricity Used *
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={formData.electricityUsed}
                    onChange={(e) => handleInputChange('electricityUsed', e.target.value)}
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                    placeholder="e.g., 350"
                    min="0"
                    step="0.1"
                    required
                  />
                  <select
                    value={formData.energyUnit}
                    onChange={(e) => handleInputChange('energyUnit', e.target.value)}
                    className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="kWh">kWh</option>
                    <option value="MWh">MWh</option>
                    <option value="units">Units</option>
                  </select>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  From your monthly utility bill. "Units" are assumed to be kWh.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Billing Period (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Info Card (Unchanged) */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <i className="fas fa-info-circle text-purple-500 text-lg mt-0.5"></i>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-purple-800 mb-1">
                  About Operational Carbon
                </h4>
                <p className="text-sm text-purple-700">
                  {logType === 'device' 
                    ? 'This logs the carbon emissions from electricity used by your devices during operation. The calculation considers device power consumption and your local grid emission factor.'
                    : 'This logs the carbon emissions from your total household electricity consumption. Based on your monthly utility bill and regional electricity grid emissions.'
                  }
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

          {/* Submit Button (Unchanged) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                !isLoading
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Loading...' : `Log ${logType === 'device' ? 'Device' : 'Monthly'} Emission`}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default EnergyLog;