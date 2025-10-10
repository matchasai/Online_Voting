import axios from "axios";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: New password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Step 1: Send OTP to mobile number
  const handleSendOTP = async (e) => {
    e.preventDefault();
    // Require email only
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
  const emailVal = formData.email?.trim().toLowerCase();
  const payload = { email: emailVal };
  console.log("Sending forgot-password payload:", JSON.stringify(payload));
  const response = await axios.post(`${API_URL}/api/user/forgot-password`, payload);
      
      if (response.data.success) {
        toast.success(response.data.message || "OTP sent successfully");
        setOtpSent(true);
        setStep(2);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6 || !/^\d{6}$/.test(formData.otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
  const payload = { email: formData.email?.trim().toLowerCase(), otp: formData.otp.trim() };
  console.log("Verifying OTP with payload:", JSON.stringify(payload));
  const response = await axios.post(`${API_URL}/api/user/verify-otp`, payload);
      
      if (response.data.success) {
        toast.success("OTP verified successfully");
        setStep(3);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      toast.error("Password must be at least 6 characters with 1 uppercase, 1 number, and 1 special character");
      return;
    }

    setLoading(true);
    try {
      const payload = { email: formData.email?.trim().toLowerCase(), otp: formData.otp.trim(), newPassword: formData.newPassword };
      console.log("Resetting password with payload:", JSON.stringify(payload));
      const response = await axios.post(`${API_URL}/api/user/reset-password`, payload);
      
      if (response.data.success) {
        toast.success("Password reset successfully! You can now login with your new password");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-8 py-8 mt-16" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        
        {/* Step 1: Enter Mobile Number */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
                <p className="text-gray-300 text-center">Enter your registered email to receive an OTP</p>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email Address" 
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" 
                  onChange={handleChange} 
                  disabled={loading}
                />
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-blue-400 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-gray-300 text-center">
              Enter the 6-digit OTP sent to {formData.email}
            </p>
            <input 
              type="text" 
              name="otp" 
              placeholder="Enter OTP" 
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500 text-center text-xl tracking-widest" 
              onChange={handleChange} 
              required 
              pattern="\d{6}"
              maxLength="6"
              title="Enter the 6-digit OTP"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <div className="text-center">
                <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-blue-400 hover:underline"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-gray-300 text-center">Create a new password</p>
            <input 
              type="password" 
              name="newPassword" 
              placeholder="New Password" 
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" 
              onChange={handleChange} 
              required 
              minLength="6"
              title="Password must be at least 6 characters with 1 uppercase, 1 number, and 1 special character"
              disabled={loading}
            />
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm New Password" 
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" 
              onChange={handleChange} 
              required 
              minLength="6"
              title="Re-enter your new password"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
