import express from "express";
import { getAllPartyVotes, getVotesByPartyInDistrict, getVotesByCandidateInParty } from "../controllers/voteController.js";

const router = express.Router();

router.get("/parties", getAllPartyVotes); // Get all party votes
router.get("/party/:partyId/district/:districtId", getVotesByPartyInDistrict); // Get votes for a party in a district
router.get("/party/:partyId/candidates", getVotesByCandidateInParty); // Get candidate votes by party

export default router;
