import express from "express";
import {
    addConstituency,
    deleteConstituency,
    getAllConstituencies,
    getConstituencyById,
    updateConstituency,
} from "../controllers/constituencyController.js";

const router = express.Router();

// ✅ API Routes for Constituencies
router.post("/add", addConstituency);
router.get("/", getAllConstituencies);
router.get("/:id", getConstituencyById);
router.put("/:id", updateConstituency);
router.delete("/:id", deleteConstituency);

export default router;
