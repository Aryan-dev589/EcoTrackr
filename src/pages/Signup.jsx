// src/pages/Signup.jsx
// --- COPY THIS ENTIRE FILE ---
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import api from '../api/axiosconfig';

function Signup() {
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    country_code: '',
    state_code: '',
    city: ''
  });
  
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

  if (!formData.username || !formData.email || !formData.password || !formData.country_code || !formData.state_code || !formData.city) {
    setError("All fields are required.");
    return;
  }

    try {
      const response = await api.post(
        '/api/auth/signup',
        formData
      );

      // --- THIS IS THE CRITICAL LOGIC ---
      if (response.data.token) {
        // SUCCESS: Backend sent a token
        localStorage.setItem('authToken', response.data.token);
        alert("Signup successful! Welcome!");
        navigate('/Dashboard'); // <-- Redirects to Dashboard
      } else {
        // FAIL: Backend did NOT send a token
        setError("Signup successful, but auto-login failed. Please log in.");
        navigate('/login'); // <-- This is what's happening to you
      }
      // --- END OF CRITICAL LOGIC ---

    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Signup failed. Please try again.");
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #e6f4f1 0%, #ecfdf5 50%, #e0f2f1 100%)',
    }}>
      <motion.div
        className="w-full max-w-md bg-white/90 rounded-3xl shadow-xl p-8 border border-green-100"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center"><i className="fas fa-user-plus"></i> Sign Up</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Full Name (will be your username)"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="text"
            name="country_code"
            placeholder="Country Code (e.g., IN)"
            value={formData.country_code}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="text"
            name="state_code"
            placeholder="State Code (e.g., IN-KA for Karnataka)"
            value={formData.state_code}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="text"
            name="city"
            placeholder="City (e.g., Bangalore)"
            value={formData.city}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-100 rounded-lg text-center">
              {error}
            </div>
          )}

          <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 rounded-lg shadow-md hover:bg-green-700 transition font-semibold">
            Sign Up
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default Signup;