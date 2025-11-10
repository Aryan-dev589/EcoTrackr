// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosconfig';

function Login() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email || !formData.password) {
        setError("Email and password are required.");
        return;
    }

    try {
      const response = await api.post(
        '/api/auth/login',
        formData
      );

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        alert("Login successful! Welcome back.");
        
        // ✅ Here is the update:
        // This now redirects to /Dashboard
        navigate('/Dashboard'); 
      } else {
        setError("Login failed. No token received.");
      }

    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Please try again.");
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
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center"><i className="fas fa-sign-in-alt"></i> Login</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
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
          
          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-100 rounded-lg text-center">
              {error}
            </div>
          )}

          <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 rounded-lg shadow-md hover:bg-green-700 transition font-semibold">
            Login
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <span className="text-gray-600">Don't have an account?</span>
          <button
            className="ml-2 text-green-700 font-semibold hover:underline"
            onClick={() => navigate('/signup')} // This also relies on your router
          >
            Sign Up
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;