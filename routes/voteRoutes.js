import express from "express";
import { check } from "express-validator";
import { castVote, getAllPartyVotes, getTopCandidates, getVotesByCandidateInParty, getVotesByDistrict, getVotesByPartyInDistrict } from "../controllers/voteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/cast",
  protect,
  [
    check("constituencyId").notEmpty(),
    check("candidateId").optional().isString(),
    check("isNota").optional().isBoolean()
  ],
  castVote
);

router.get("/parties", getAllPartyVotes);
router.get("/district/:districtId", getVotesByDistrict);
router.get("/top-candidates", getTopCandidates);
router.get("/party/:partyId/district/:districtId", getVotesByPartyInDistrict);
router.get("/party/:partyId/candidates", getVotesByCandidateInParty);

export default router;
