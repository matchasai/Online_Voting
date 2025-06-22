import express from "express";
import {
    createParty,
    deleteParty,
    getParties,
    getPartyById,
    updateParty
} from "../controllers/partyController.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = express.Router();

// ✅ Create a party
router.post("/", uploadMiddleware("symbol"), createParty);

// ✅ Fetch all parties
router.get("/", getParties);

// ✅ Fetch a single party by ID
router.get("/:id", getPartyById);

// ✅ Update a party (Image update optional)
router.put("/:id", uploadMiddleware("symbol"), updateParty);

// ✅ Delete a party
router.delete("/:id", deleteParty);

export default router;