import { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import Signup from "./Signup";
import Login from "./Login";

function Landing() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100">
      <h1 className="text-4xl font-bold text-green-700 mb-6">EcoTrackr 🌱</h1>

      <div className="space-x-4">
        <button
          onClick={() => setShowSignup(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          Sign Up
        </button>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Log In
        </button>
      </div>

      {/* Signup Modal */}
      <Modal isOpen={showSignup} onClose={() => setShowSignup(false)}>
        <Signup />
      </Modal>

      {/* Login Modal */}
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <Login />
      </Modal>
    </div>
  );
}

export default Landing;

