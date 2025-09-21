// src/pages/Login.jsx
function Login() {
  return (
    <form className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 border rounded-lg"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 border rounded-lg"
      />
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg">
        Login
      </button>
    </form>
  );
}

export default Login;
