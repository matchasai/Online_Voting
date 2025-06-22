import express from "express";
import {
    addConstituency,
    deleteConstituency,
    getAllConstituencies,
    getConstituencyById,
    getNotaVotesByConstituency,
    getNotaVotesByDistrict,
    getTotalNotaVotes,
    getTurnoutByConstituency,
    getTurnoutByDistrict,
    getOverallTurnout,
    updateConstituency
} from "../controllers/constituencyController.js";

const router = express.Router();

// ✅ API Routes for Constituencies
router.post("/add", addConstituency);
router.get("/", getAllConstituencies);
router.get("/:id", getConstituencyById);
router.put("/:id", updateConstituency);
router.delete("/:id", deleteConstituency);
router.get("/nota/total", getTotalNotaVotes);
router.get("/nota/district/:districtId", getNotaVotesByDistrict);
router.get("/nota/constituency/:constituencyId", getNotaVotesByConstituency);
router.get("/turnout/district/:districtId", getTurnoutByDistrict);
router.get("/turnout/constituency/:constituencyId", getTurnoutByConstituency);
router.get("/turnout/overall", getOverallTurnout);

export default router;
