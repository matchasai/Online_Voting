import express from "express";
import {
    addCandidate,
    getAllCandidates,
    getCandidateById,
    incrementVote,
    removeCandidate,
    updateCandidate
} from "../controllers/candidateController.js";

const router = express.Router();

router.post("/add", addCandidate);
router.get("/", getAllCandidates);
router.get("/:id", getCandidateById);
router.put("/:id", updateCandidate);
router.delete("/:id", removeCandidate);
router.post("/:id/vote", incrementVote);  // ✅ New route for voting

export default router;
