import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import Candidate from "../models/Candidate.js";
import Constituency from "../models/Constituency.js";
import District from "../models/District.js";
import OTP from "../models/OTP.js";
import Party from "../models/Party.js";
import User from "../models/User.js";
import { sendOTP } from "../services/smsService.js";

// ✅ Get User by Aadhar Number (New)
export const getUserByAadhar = async (req, res) => {
    try {
        const { aadharNumber } = req.body;
        if (!aadharNumber) {
            return res.status(400).json({ message: "Aadhar number is required" });
        }
        // Populate district and constituency
        const user = await User.findOne({ aadharNumber })
            .populate("district", "_id name")
            .populate("constituency", "_id name")
            .select("name district constituency");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            name: user.name,
            district: user.district?._id || null,
            districtName: user.district?.name || null,
            constituency: user.constituency?._id || null,
            constituencyName: user.constituency?.name || null
        });
    } catch (error) {
        console.error("Error fetching user by aadhar:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
};
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// ✅ User Signup
export const signup = async (req, res) => {
    try {
        const { name, aadharNumber, mobile, age, gender, district, constituency, password, confirmPassword } = req.body;

        // Validate required fields
        if (!name || !aadharNumber || !mobile || !age || !gender || !district || !constituency || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if Aadhar or mobile is already registered
        if (await User.findOne({ aadharNumber })) {
            return res.status(400).json({ message: "Aadhar Number already registered" });
        }
        if (await User.findOne({ mobile })) {
            return res.status(400).json({ message: "Mobile Number already registered" });
        }

        // Input validations
        if (!validator.isNumeric(aadharNumber) || aadharNumber.length !== 12) {
            return res.status(400).json({ message: "Aadhar Number must be a 12-digit number" });
        }
        if (!validator.isNumeric(mobile) || mobile.length !== 10) {
            return res.status(400).json({ message: "Mobile Number must be a 10-digit number" });
        }
        if (!validator.isAlpha(name.replace(/ /g, ""))) {
            return res.status(400).json({ message: "Name should contain only alphabets" });
        }
        if (!validator.isInt(age.toString(), { min: 18 })) {
            return res.status(400).json({ message: "Age must be at least 18" });
        }
        if (!validator.isStrongPassword(password, { minLength: 6, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
            return res.status(400).json({ message: "Password must be strong (min 6 chars, 1 uppercase, 1 number, 1 special char)" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Validate district and constituency
        const districtExists = await District.findOne({ name: { $regex: `^${district}$`, $options: "i" } });
        if (!districtExists) {
            return res.status(400).json({ message: "Invalid district. Please select a valid district." });
        }

        const constituencyExists = await Constituency.findOne({ name: { $regex: `^${constituency}$`, $options: "i" } });
        if (!constituencyExists) {
            return res.status(400).json({ message: "Invalid constituency. Please select a valid constituency." });
        }

        // Create a new user (password hashing handled by schema middleware)
        const user = new User({
            name,
            aadharNumber,
            mobile,
            age,
            gender,
            district: districtExists._id,
            constituency: constituencyExists._id,
            password, // Will be hashed in the model
        });

        await user.save();
        const token = generateAccessToken(user);

        res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server Error. Please try again later.", error: error.message });
    }
};

// ✅ User Login
export const login = async (req, res) => {
    try {
        const { aadharNumber, password } = req.body;
        if (!aadharNumber || !password) {
            return res.status(400).json({ message: "Please provide both Aadhar and password." });
        }
        const user = await User.findOne({ aadharNumber }).select("+password name");
        if (!user) {
            return res.status(400).json({ message: "Aadhar Number not registered." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refreshToken = refreshToken;
        await user.save();
        res.cookie("userRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({ message: "Login successful", token: accessToken, username: user.name });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error. Please try again later.", error: error.message });
    }
};

export const userRefreshToken = async (req, res) => {
    const refreshToken = req.cookies.userRefreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }
    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        // ROTATE refresh token
        const newRefreshToken = generateRefreshToken(user);
        user.refreshToken = newRefreshToken;
        await user.save();
        res.cookie("userRefreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        const newAccessToken = jwt.sign(
            { id: decoded.id, isAdmin: decoded.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );
        return res.status(200).json({ token: newAccessToken });
    } catch (error) {
        user.refreshToken = null;
        await user.save();
        return res.status(401).json({ message: "Refresh token expired. Please log in again." });
    }
};

// ✅ Logout Endpoint
export const logout = async (req, res) => {
    const refreshToken = req.cookies.userRefreshToken;
    if (refreshToken) {
        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
    }
    res.clearCookie("userRefreshToken");
    res.status(200).json({ message: "Logged out successfully." });
};

// ✅ Get User Details by ID
export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(id)
            .populate("district", "name")
            .populate("constituency", "name")
            .select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            name: user.name,
            aadharNumber: user.aadharNumber,
            mobile: user.mobile,
            hasVoted: user.hasVoted || false,
            district: user.district?.name || "N/A",
            constituency: user.constituency?.name || "N/A",
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ Get Current User Profile (from JWT token)
export const getUserProfile = async (req, res) => {
    try {
        // User ID should be available from auth middleware
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authorized, please log in" });
        }

        // Find user and populate district/constituency data
        const user = await User.findById(userId)
            .populate("district")
            .populate("constituency")
            .select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return formatted user data including district and constituency IDs
        res.status(200).json({
            name: user.name,
            aadharNumber: user.aadharNumber,
            mobile: user.mobile,
            age: user.age,
            gender: user.gender,
            hasVoted: user.hasVoted || false,
            district: user.district?._id || null,
            districtName: user.district?.name || "N/A",
            constituency: user.constituency?._id || null,
            constituencyName: user.constituency?.name || "N/A",
            isAdmin: user.isAdmin || false
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Reset all votes for all users, candidates, and parties
export const resetAllVotes = async (req, res) => {
  try {
    await User.updateMany({}, { hasVoted: false });
    await Candidate.updateMany({}, { voteCount: 0 });
    await Party.updateMany({}, { voteCount: 0 });
    res.status(200).json({ message: 'All votes have been reset.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset votes.', error: error.message });
  }
};

// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validate mobile number
    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required." });
    }

    // Check if mobile number is valid (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit mobile number." });
    }

    // Check if user exists with this mobile number
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "No user found with this mobile number." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this mobile number
    await OTP.deleteMany({ mobileNumber: mobile });

    // Save OTP to database
    const otpDoc = new OTP({
      mobileNumber: mobile,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await otpDoc.save();

    // Send OTP via SMS
    const smsResult = await sendOTP(mobile, otp);
    
    if (smsResult.success) {
      res.status(200).json({ 
        success: true,
        message: "OTP sent successfully to your mobile number.",
        mobileNumber: mobile 
      });
    } else {
      // Delete the OTP if SMS failed
      await OTP.deleteOne({ _id: otpDoc._id });
      res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Validate input
    if (!mobile || !otp) {
      return res.status(400).json({ message: "Mobile number and OTP are required." });
    }

    // Find OTP in database
    const otpDoc = await OTP.findOne({ 
      mobileNumber: mobile, 
      otp,
      expiresAt: { $gt: new Date() } // Check if not expired
    });

    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark OTP as verified
    otpDoc.isVerified = true;
    await otpDoc.save();

    res.status(200).json({ 
      success: true,
      message: "OTP verified successfully.",
      mobileNumber: mobile 
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;

    // Validate input
    if (!mobile || !otp || !newPassword) {
      return res.status(400).json({ message: "Mobile number, OTP, and new password are required." });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Find verified OTP
    const otpDoc = await OTP.findOne({ 
      mobileNumber: mobile, 
      otp,
      isVerified: true,
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    // Find user
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpDoc._id });

    res.status(200).json({ success: true, message: "Password reset successfully. You can now login with your new password." });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};