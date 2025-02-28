import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:5000/api/users"; // Backend URL

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/login`, { identifier, password });

      console.log("Login Response:", res.data); // Debugging

      if (!res.data.user) {
        throw new Error("Invalid response from server");
      }

      // ✅ Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login Successful! 🎉"); // ✅ Success toast
      setTimeout(() => {
        navigate("/Home2"); // ✅ Redirect after success
      }, 2000);
    } catch (error) {
      console.error("Login Error:", error);

      // ✅ Show different errors based on response
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Invalid credentials! ❌"); // Unauthorized (wrong username/password)
        } else {
          toast.error(error.response.data.message || "Login Failed! ❌");
        }
      } else {
        toast.error("Server error. Please try again later! ⚠️");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-400">Aadhaar / Mobile Number</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
          >
            Login
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

      {/* ✅ Toast Container to Display Messages */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
