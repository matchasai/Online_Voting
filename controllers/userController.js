import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ✅ User Signup
export const signup = async (req, res) => {
    try {
        console.log("Received Data:", req.body); // Debugging request data

        const { name, mobile, aadhaar, age, gender, password, confirmPassword } = req.body;

        // Validate required fields
        if (!name || !mobile || !aadhaar || !age || !gender || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match!" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ aadhaar }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            name,
            mobile,
            aadhaar,
            age,
            gender,
            password: hashedPassword,
        });

        // Generate JWT Token
        const token = generateToken(newUser._id);

        res.status(201).json({ 
            message: "User registered successfully!", 
            user: { name: newUser.name, mobile: newUser.mobile, aadhaar: newUser.aadhaar, age: newUser.age, gender: newUser.gender },
            token
        });

    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ message: "Server Error!", error: error.message });
    }
};

// ✅ User Login
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Validate input
        if (!identifier || !password) {
            return res.status(400).json({ message: "Identifier and password are required!" });
        }

        // Find user by Aadhaar or Mobile
        const user = await User.findOne({ $or: [{ aadhaar: identifier }, { mobile: identifier }] });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // Generate JWT Token
        const token = generateToken(user._id);

        res.json({ 
            message: "Login successful!", 
            user: { name: user.name, mobile: user.mobile, aadhaar: user.aadhaar, age: user.age, gender: user.gender },
            token 
        });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ message: "Server Error!", error: error.message });
    }
};

// ✅ Get User Details (By Aadhaar or Mobile)
export const getUserDetails = async (req, res) => {
    try {
        const { identifier } = req.params;

        if (!identifier) {
            return res.status(400).json({ message: "Identifier (Aadhaar or Mobile) is required" });
        }

        const user = await User.findOne({ $or: [{ aadhaar: identifier }, { mobile: identifier }] });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            name: user.name,
            mobile: user.mobile,
            aadhaar: user.aadhaar,
            age: user.age,
            gender: user.gender
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};
