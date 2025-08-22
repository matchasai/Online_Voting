import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sanitizeInput } from "../utils/sanitizeInput";
import userApi from "../utils/userApi";

const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    aadharNumber: "",
    age: "",
    gender: "",
    district: "",
    constituency: "",
    password: "",
    confirmPassword: "",
  });

  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);

  // Fetch Districts on Component Mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/districts`);
        setDistricts(response.data);
      } catch (error) {
        toast.error("Failed to load districts");
      }
    };
    fetchDistricts();
  }, []);

  // Fetch Constituencies when District is Selected
  const fetchConstituencies = async (districtId) => {
    try {
      const response = await axios.get(`${API_URL}/api/constituencies?district=${districtId}`);
      setConstituencies(response.data);
    } catch (error) {
      toast.error("Failed to load constituencies");
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: sanitizeInput(value) });

    // If district is changed, fetch respective constituencies
    if (name === "district") {
      const selectedDistrict = districts.find((dist) => dist.name === value);
      if (selectedDistrict) {
        fetchConstituencies(selectedDistrict._id); // Fetch constituencies for selected district
        setFormData((prev) => ({ ...prev, constituency: "" })); // Reset constituency
      }
    }
  };

  // Handle Signup Submission
  const handleSignup = async (e) => {
    e.preventDefault();

    if (parseInt(formData.age) < 18) {
      toast.error("You must be at least 18 years old to register.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (formData.mobile.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (!formData.gender) {
      toast.error("Please select a gender");
      return;
    }
    if (!formData.constituency || !formData.district) {
      toast.error("Please select your constituency and district");
      return;
    }

    try {
      // Sanitize all formData before sending
      const sanitizedData = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, sanitizeInput(v)])
      );
      const response = await userApi.post("/user/signup", sanitizedData);
      if (response.status === 201 || response.status === 200) {
        toast.success("Signup Successful!");
        if (response.data && response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed!");
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
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="text" name="name" placeholder="Name" className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" onChange={handleChange} required 
            aria-label="Name" title="Enter your full name" />
          <input type="text" name="mobile" placeholder="Mobile" className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" onChange={handleChange} required 
            aria-label="Mobile" title="Enter your 10-digit mobile number" />
          <input type="text" name="aadharNumber" placeholder="Aadhaar Number" className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" onChange={handleChange} required 
            aria-label="Aadhaar Number" title="Enter your 12-digit Aadhaar Number" />
          <input type="number" name="age" placeholder="Age" className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" onChange={handleChange} required 
            aria-label="Age" title="Enter your age" />

          {/* Gender Dropdown */}
          <select name="gender" className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" onChange={handleChange} required
            aria-label="Gender" title="Select your gender">
            <option value="" hidden>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {/* District Dropdown */}
          <select name="district" className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" onChange={handleChange} required
            aria-label="District" title="Select your district">
            <option value="" hidden>Select District</option>
            {districts.map((dist) => (
              <option key={dist._id} value={dist.name}>{dist.name}</option>
            ))}
          </select>

          {/* Constituency Dropdown */}
          <select name="constituency" className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" onChange={handleChange} required disabled={!formData.district}
            aria-label="Constituency" title="Select your constituency">
            <option value="" hidden>Select Constituency</option>
            {constituencies.map((consti) => (
              <option key={consti._id} value={consti.name}>{consti.name}</option>
            ))}
          </select>

          <input type="password" name="password" placeholder="Password" className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" onChange={handleChange} required 
            aria-label="Password" title="Enter your password" />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-blue-500" onChange={handleChange} required 
            aria-label="Confirm Password" title="Re-enter your password" />
          
          <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
            aria-label="Sign Up Button" title="Click to sign up">Sign Up</button>
        </form>

        <p className="text-center text-gray-400">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
