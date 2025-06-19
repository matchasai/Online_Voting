import express from "express";
import {
    addDistrict,
    getAllDistricts,
    getDistrictById,
    removeDistrict,
    updateDistrict
} from "../controllers/districtController.js";

const router = express.Router();

router.post("/add", addDistrict);
router.get("/", getAllDistricts);
router.get("/:id", getDistrictById);
router.put("/:id", updateDistrict);
router.delete("/:id", removeDistrict);

export default router;
