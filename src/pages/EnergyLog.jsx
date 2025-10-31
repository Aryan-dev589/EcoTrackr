// src/pages/EnergyLog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EnergyLog = () => {
  const navigate = useNavigate();
  const [logType, setLogType] = useState('device'); // 'device' or 'bill'
  const [formData, setFormData] = useState({
    // Device logging fields
    deviceId: '',
    duration: '',
    durationUnit: 'hours',
    
    // Bill logging fields
    electricityUsed: '',
    energyUnit: 'kWh',
    startDate: '',
    endDate: '',
    
    // Common
    estimatedEmission: null
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // Mock user's registered devices
  const userDevices = [
    { id: '1', name: 'My iPhone 15', type: 'smartphone', powerConsumption: 5 }, // watts
    { id: '2', name: 'MacBook Pro', type: 'laptop', powerConsumption: 60 },
    { id: '3', name: 'Gaming PC', type: 'computer', powerConsumption: 400 },
    { id: '4', name: 'Refrigerator', type: 'appliance', powerConsumption: 150 },
    { id: '5', name: 'Air Conditioner', type: 'appliance', powerConsumption: 1000 },
    { id: '6', name: 'LED TV', type: 'entertainment', powerConsumption: 80 },
    { id: '7', name: 'Washing Machine', type: 'appliance', powerConsumption: 500 },
    { id: '8', name: 'Electric Vehicle', type: 'transport', powerConsumption: 6500 }
  ];

  // Calculate emissions whenever relevant fields change
  useEffect(() => {
    calculateEmission();
  }, [logType, formData.deviceId, formData.duration, formData.durationUnit, formData.electricityUsed]);

  const calculateEmission = () => {
    if ((logType === 'device' && (!formData.deviceId || !formData.duration)) ||
        (logType === 'bill' && !formData.electricityUsed)) {
      setFormData(prev => ({ ...prev, estimatedEmission: null }));
      return;
    }

    setIsCalculating(true);
    
    setTimeout(() => {
      let emission = 0;
      
      if (logType === 'device') {
        const device = userDevices.find(d => d.id === formData.deviceId);
        if (device) {
          // Convert duration to hours
          let durationHours = parseFloat(formData.duration);
          if (formData.durationUnit === 'minutes') {
            durationHours = durationHours / 60;
          }
          
          // Calculate kWh: (watts * hours) / 1000
          const kWh = (device.powerConsumption * durationHours) / 1000;
          
          // Calculate CO2: kWh * emission factor (0.5 kg CO2/kWh - average grid)
          emission = kWh * 0.5;
        }
      } else {
        // Monthly bill calculation
        const kWh = parseFloat(formData.electricityUsed);
        // Convert units if needed
        const actualKWh = formData.energyUnit === 'kWh' ? kWh : 
                         formData.energyUnit === 'MWh' ? kWh * 1000 : kWh;
        
        emission = actualKWh * 0.5; // 0.5 kg CO2 per kWh
      }
      
      setFormData(prev => ({ ...prev, estimatedEmission: emission }));
      setIsCalculating(false);
    }, 300);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (logType === 'device' && (!formData.deviceId || !formData.duration)) {
      alert('Please select a device and enter duration');
      return;
    }
    
    if (logType === 'bill' && !formData.electricityUsed) {
      alert('Please enter electricity usage');
      return;
    }

    const logData = {
      logType,
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    console.log('Energy log data:', logData);
    alert(`Energy use logged successfully! Emission: ${formData.estimatedEmission.toFixed(2)} kg CO₂e`);
    navigate('/dashboard');
  };

  // Set default dates for monthly bill
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

  const getDeviceIcon = (type) => {
    const icons = {
      smartphone: '📱',
      laptop: '💻',
      computer: '🖥️',
      appliance: '🔌',
      entertainment: '📺',
      transport: '🚗'
    };
    return icons[type] || '⚡';
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
            <h1 className="text-xl font-semibold text-gray-900">Log Energy Use</h1>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Real-time Emission Display */}
          {formData.estimatedEmission !== null && formData.estimatedEmission > 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Estimated Carbon Emission</h3>
                  <div className="flex items-baseline space-x-2">
                    {isCalculating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">{formData.estimatedEmission.toFixed(2)}</span>
                        <span className="text-lg">kg CO₂e</span>
                      </>
                    )}
                  </div>
                  <p className="text-purple-100 text-sm mt-2">
                    {logType === 'device' ? 'Based on device usage' : 'Based on monthly electricity consumption'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl">⚡</div>
                </div>
              </div>
            </div>
          )}

          {/* Log Type Toggle */}
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

          {/* Device Logging Form */}
          {logType === 'device' && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Device / Appliance *
                </label>
                <select
                  value={formData.deviceId}
                  onChange={(e) => handleInputChange('deviceId', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a device</option>
                  {userDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {getDeviceIcon(device.type)} {device.name} ({device.powerConsumption}W)
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Lists all registered devices/appliances
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
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    required
                  />
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => handleInputChange('durationUnit', e.target.value)}
                    className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

          {/* Monthly Bill Logging Form */}
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
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    required
                  />
                  <select
                    value={formData.energyUnit}
                    onChange={(e) => handleInputChange('energyUnit', e.target.value)}
                    className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="kWh">kWh</option>
                    <option value="MWh">MWh</option>
                    <option value="units">Units</option>
                  </select>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  From your monthly utility bill
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Billing Period *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Information Card */}
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

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              disabled={!formData.estimatedEmission || isCalculating}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                formData.estimatedEmission && !isCalculating
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isCalculating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </div>
              ) : (
                `Log ${logType === 'device' ? 'Device' : 'Monthly'} Emission (${formData.estimatedEmission ? formData.estimatedEmission.toFixed(2) : '0'} kg CO₂e)`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnergyLog;