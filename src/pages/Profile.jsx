// src/pages/Profile.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Profile() {
  // Dummy user data (later from backend)
  const user = {
    name: "Aryan Mishra",
    email: "aryan@example.com",
    joined: "August 2025",
    avatar: "https://i.pravatar.cc/150?img=3", // Placeholder avatar
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 p-6">
      <motion.div
        className="w-full max-w-lg bg-white/90 rounded-3xl shadow-2xl p-10 border border-green-100 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2"><i className="fas fa-user-circle"></i> Your Profile</h1>
          <Link
            to="/dashboard"
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition flex items-center gap-1"
          >
            <i className="fas fa-arrow-left"></i> Dashboard
          </Link>
        </div>
        {/* Profile Card */}
        <div className="flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative mb-4">
            <img
              src={user.avatar}
              alt="Profile"
              className="w-28 h-28 rounded-full shadow-lg border-4 border-green-200 object-cover"
            />
            <span className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></span>
          </div>
          {/* User Info */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">{user.name}</h2>
          <p className="text-gray-600 mb-1">{user.email}</p>
          <p className="text-gray-500 mb-2">Joined {user.joined}</p>
          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            {/* Edit Profile Button (placeholder) */}
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition flex items-center gap-2"
            >
              <i className="fas fa-edit"></i> Edit Profile
            </button>
            {/* Logout Button */}
            <Link
              to="/"
              className="bg-red-500 text-white px-6 py-2 rounded-lg shadow hover:bg-red-600 transition flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;

