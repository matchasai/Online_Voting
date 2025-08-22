import express from "express";
import { check } from "express-validator";
import {
    getUserByAadhar,
    getUserDetails,
    getUserProfile,
    login,
    logout,
    resetAllVotes,
    signup,
    userRefreshToken
} from "../controllers/userController.js";
import { authMiddleware, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/signup",
  [
    check("name").isString().trim().notEmpty(),
    check("aadharNumber").isNumeric().isLength({ min: 12, max: 12 }),
    check("mobile").isNumeric().isLength({ min: 10, max: 10 }),
    check("age").isInt({ min: 18 }),
    check("gender").isString().notEmpty(),
    check("district").notEmpty(),
    check("constituency").notEmpty(),
    check("password").isStrongPassword({ minLength: 6, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
    check("confirmPassword").notEmpty()
  ],
  signup
);
router.post(
  "/login",
  [
    check("aadharNumber").isNumeric().isLength({ min: 12, max: 12 }),
    check("password").isString().notEmpty()
  ],
  login
);
router.post("/get-by-aadhar", getUserByAadhar);
router.get("/getUser/:id", authMiddleware, getUserDetails);

router.get("/profile", protect, getUserProfile);

// Test endpoint to check if token is valid
router.get("/test-auth", protect, (req, res) => {
  res.json({ message: "Token is valid", user: req.user });
});

router.post("/reset-all-votes", resetAllVotes);
router.post("/logout", logout);
router.post("/refresh-token", userRefreshToken);

export default router;