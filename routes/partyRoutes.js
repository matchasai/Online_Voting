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

router.post("/", uploadMiddleware("symbol"), createParty);

router.get("/", getParties);

router.get("/:id", getPartyById);

router.put("/:id", uploadMiddleware("symbol"), updateParty);

router.delete("/:id", deleteParty);

export default router;