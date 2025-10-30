// src/pages/Signup.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Signup() {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would handle signup logic, then redirect:
    navigate('/dashboard');
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 py-12 px-4">
      <motion.div
        className="w-full max-w-md bg-white/90 rounded-3xl shadow-xl p-8 border border-green-100"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center flex items-center gap-2 justify-center"><i className="fas fa-user-plus"></i> Sign Up</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 rounded-lg shadow-md hover:bg-green-700 transition font-semibold">
            Sign Up
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default Signup;
