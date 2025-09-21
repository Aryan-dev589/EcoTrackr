// src/pages/Profile.jsx
import { Link } from "react-router-dom";

function Profile() {
  // Dummy user data (later from backend)
  const user = {
    name: "Aryan Mishra",
    email: "aryan@example.com",
    joined: "August 2025",
    avatar: "https://i.pravatar.cc/150?img=3", // Placeholder avatar
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Your Profile</h1>

        {/* Back to Dashboard */}
        <Link
          to="/dashboard"
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          ← Back to Dashboard
        </Link>
      </header>

      {/* Profile Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center">
        {/* Profile Picture */}
        <img
          src={user.avatar}
          alt="Profile"
          className="w-24 h-24 rounded-full shadow mb-4"
        />

        {/* User Info */}
        <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-500 mt-2">Joined {user.joined}</p>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          {/* Edit Profile Button (placeholder) */}
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            ✏️ Edit Profile
          </button>

          {/* Logout Button */}
          <Link
            to="/"
            className="bg-red-500 text-white px-6 py-2 rounded-lg shadow hover:bg-red-600 transition"
          >
            🚪 Logout
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;

