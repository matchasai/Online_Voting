import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../App";
import { sanitizeInput } from "../utils/sanitizeInput";
import userApi from "../utils/userApi";

const Login = () => {
  const { setUser } = useContext(UserContext);
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
      const response = await userApi.post("/user/login", {
        aadharNumber: sanitizeInput(aadharNumber),
        password: sanitizeInput(password),
      });

      const data = response.data;

      if (data.token) {
        setUser(data); // Set user in context
        localStorage.setItem("userToken", data.token);
        toast.success("Login Successful!", {
          autoClose: 1000,
          onClose: () => navigate("/home"), // ✅ Redirect after toast disappears
        });
      } else {
        toast.error(data.message || "Login Failed!", { autoClose: 1000 });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Network Error. Please try again.";
      toast.error(errorMessage, { autoClose: 1000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-400">Aadhaar Number</label>
            <input
              type="text"
              value={aadharNumber}
              onChange={(e) => setAadharNumber(sanitizeInput(e.target.value))}
              className="w-full px-4 py-2 mt-2 bg-gray-700 text-white rounded-lg"
              required
              aria-label="Aadhaar Number"
              title="Enter your 12-digit Aadhaar Number"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(sanitizeInput(e.target.value))}
              className="w-full px-4 py-2 mt-2 bg-gray-700 text-white rounded-lg"
              required
              aria-label="Password"
              title="Enter your password"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-lg ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
            aria-label="Login Button"
            title="Click to login"
          >
            {loading ? <span className="loader" aria-label="Loading Spinner"></span> : "Login"}
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
