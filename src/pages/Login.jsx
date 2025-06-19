import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ setIsLoggedIn }) => {
  const [aadharNumber, setAadharNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (aadharNumber.length !== 12 || !/^\d+$/.test(aadharNumber)) {
      toast.error("Invalid Aadhaar Number. Must be 12 digits.", { autoClose: 1000 });
      setLoading(false);
      return;
    }
  
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.", { autoClose: 1000 });
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadharNumber, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("aadharNumber", aadharNumber);
        localStorage.setItem("username", data.username || "User");

        setIsLoggedIn(true);

        toast.success("Login Successful!", {
          autoClose: 1000,
          onClose: () => navigate("/Home2"), // ✅ Redirect after toast disappears
        });
      } else {
        toast.error(data.message || "Login Failed!", { autoClose: 1000 });
      }
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Network Error. Please try again.", { autoClose: 1000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-400">Aadhaar Number</label>
            <input
              type="text"
              value={aadharNumber}
              onChange={(e) => setAadharNumber(e.target.value)}
              className="w-full px-4 py-2 mt-2 bg-gray-700 text-white rounded-lg"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 bg-gray-700 text-white rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-lg ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-400">Don't have an account? </span>
            <Link to="/signup" className="text-sm text-blue-400 hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
