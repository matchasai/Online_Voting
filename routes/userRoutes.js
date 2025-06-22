import express from "express";
import {
    getUserByAadhar,
    getUserDetails,
    getUserProfile,
    login,
    resetAllVotes,
    signup
} from "../controllers/userController.js";
import { authMiddleware, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup); // Register User
router.post("/login", login); // User Login
router.post("/get-by-aadhar", getUserByAadhar); // Get user by aadhar
router.get("/getUser/:id", authMiddleware, getUserDetails);

// Protected route for user profile (requires authentication)
router.get("/profile", protect, getUserProfile);

// Reset all votes (admin only, but no auth for now)
router.post("/reset-all-votes", resetAllVotes);

export default router;