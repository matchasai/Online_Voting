import express from "express";
import { castVote, getAllPartyVotes, getVotesByCandidateInParty, getVotesByPartyInDistrict } from "../controllers/voteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/cast", protect, castVote); // Cast a vote

router.get("/parties", getAllPartyVotes); // Get all party votes
router.get("/party/:partyId/district/:districtId", getVotesByPartyInDistrict); // Get votes for a party in a district
router.get("/party/:partyId/candidates", getVotesByCandidateInParty); // Get candidate votes by party

export default router;
