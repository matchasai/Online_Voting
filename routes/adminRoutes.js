import express from "express";
import {
    addUser,
    adminLogin,
    deleteUser,
    getAdminDashboard,
    getAllUsers,
    getNonVotedUsers,
    getTopCandidates,
    getTopConstituencies,
    getTotalUsers,
    getValidDistricts,
    getVotedUsers,
    getVotes,
    getVotesTrend,
    resetAllVotes,
    resetVote,
    submitVote,
    updateUser
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Route (No Authentication Required)
router.post("/login", adminLogin);

// Protected Admin Routes (Require Authentication)
router.get("/dashboard", adminAuth, getAdminDashboard);
router.get("/users", adminAuth, getAllUsers);
router.get("/votes", adminAuth, getVotes);

// User Management Routes
router.post("/adduser", adminAuth, addUser);
router.put("/updateuser/:id", adminAuth, updateUser);
router.delete("/deleteuser/:id", adminAuth, deleteUser);
router.get("/valid-districts", adminAuth, getValidDistricts);

// Stats Routes - Adding admin authentication that was missing
router.get("/stats/total", adminAuth, getTotalUsers);
router.get("/stats/voted", adminAuth, getVotedUsers);
router.get("/stats/non-voted", adminAuth, getNonVotedUsers);

// Vote Management Routes
router.put("/vote", authMiddleware, submitVote);
router.put("/resetvote/:id", adminAuth, resetVote); // Fixed to include ID parameter
router.put("/resetallvotes", adminAuth, resetAllVotes);

// Analytics Routes
router.get("/analytics/votes-trend", adminAuth, getVotesTrend);
router.get("/analytics/top-constituencies", adminAuth, getTopConstituencies);
router.get("/analytics/top-candidates", adminAuth, getTopCandidates);

export default router;