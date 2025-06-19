import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import Constituency from "../models/Constituency.js";
import District from "../models/District.js";
import User from "../models/User.js";

// ✅ Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
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
        const token = generateToken(user);

        res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ User Login
export const login = async (req, res) => {
    try {
        const { aadharNumber, password } = req.body;

        // Validate required fields
        if (!aadharNumber || !password) {
            return res.status(400).json({ message: "Please provide both Aadhar and password" });
        }

        // Check if user exists
        const user = await User.findOne({ aadharNumber }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Aadhar Number not registered" });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user);
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
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