import express from "express";
import { getUserDetails, login, signup } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);  // Register User
router.post("/login", login);  // User Login
router.get("/:identifier", getUserDetails);  // Fetch User Details

export default router;
