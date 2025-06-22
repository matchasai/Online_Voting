import express from "express";
import {
    addCandidate,
    getAllCandidates,
    getCandidateById,
    incrementVote,
    removeCandidate,
    updateCandidate
} from "../controllers/candidateController.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = express.Router();

router.post("/add", uploadMiddleware("image"), addCandidate);
router.get("/", getAllCandidates);
router.get("/:id", getCandidateById);
router.put("/:id", uploadMiddleware("image"), updateCandidate);
router.delete("/:id", removeCandidate);
router.post("/:id/vote", incrementVote);  // ✅ New route for voting

export default router;
