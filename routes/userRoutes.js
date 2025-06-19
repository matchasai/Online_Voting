import express from "express";
import {
    getUserDetails,
    getUserProfile // Adding this import
    ,
    login,
    signup
} from "../controllers/userController.js";
import { authMiddleware, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup); // Register User
router.post("/login", login); // User Login
router.get("/getUser/:id", authMiddleware, getUserDetails);

// Protected route for user profile (requires authentication)
router.get("/profile", protect, getUserProfile);

export default router;