import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import Candidate from "../models/Candidate.js";
import Constituency from "../models/Constituency.js";
import Party from "../models/Party.js";

export const addCandidate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, partyId, constituencyId } = req.body;

    if (!name || !partyId || !constituencyId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Candidate image is required" });
    }

    // Save file to uploads directory instead of storing base64
    const fileName = `candidate_${Date.now()}_${req.file.originalname}`;
    const filePath = path.join("uploads", fileName);
    
    fs.writeFileSync(filePath, req.file.buffer);
    const image = `/uploads/${fileName}`; // Store file path instead of base64

    const party = await Party.findById(partyId).session(session);
    if (!party) throw new Error("Party not found");

    const constituency = await Constituency.findById(constituencyId).session(session);
    if (!constituency) throw new Error("Constituency not found");

    // Ensure unique candidate name in the same constituency
    const existingCandidate = await Candidate.findOne({ name, constituency: constituencyId }).session(session);
    if (existingCandidate) {
      throw new Error("Candidate with this name already exists in the constituency");
    }

    const newCandidate = new Candidate({ name, party: partyId, constituency: constituencyId, image });
    await newCandidate.save({ session });

    await Constituency.findByIdAndUpdate(constituencyId, { $push: { candidates: newCandidate._id } }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Candidate added successfully", candidate: newCandidate });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error adding candidate", error: error.message });
  }
};

export const getAllCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', district: districtId, constituency: constituencyId } = req.query;
    // Add error handling for missing/invalid district/constituency
    if (("district" in req.query && !districtId) || ("constituency" in req.query && !constituencyId)) {
      return res.status(400).json({ message: "District or Constituency parameter is missing or invalid." });
    }
    const skip = (page - 1) * limit;

    let query = {};

    // Build search query for candidate name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    
    if (districtId && constituencyId) {
      // Check if constituencyId is in the district's constituencies
      const constituenciesInDistrict = await Constituency.find({ district: districtId }).select('_id');
      const constituencyIds = constituenciesInDistrict.map(c => c._id.toString());
      if (constituencyIds.includes(constituencyId)) {
        query.constituency = constituencyId;
      } else {
        // Return empty result if constituency does not belong to district
        return res.status(200).json({ candidates: [], totalPages: 0, currentPage: 1, totalCandidates: 0 });
      }
    } else if (districtId) {
      const constituenciesInDistrict = await Constituency.find({ district: districtId }).select('_id');
      const constituencyIds = constituenciesInDistrict.map(c => c._id);
      query.constituency = { $in: constituencyIds };
    } else if (constituencyId) {
      query.constituency = constituencyId;
    }

    const candidates = await Candidate.find(query)
      .select("+image")
      .populate({
          path: 'party',
          select: 'name symbol' // Include both party name and symbol
      })
      .populate({
          path: 'constituency',
          select: 'name district',
          populate: {
              path: 'district',
              select: 'name'
          }
      })
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCandidates = await Candidate.countDocuments(query);
    const totalPages = Math.ceil(totalCandidates / limit);

    res.status(200).json({
      candidates,
      totalPages,
      currentPage: parseInt(page),
      totalCandidates,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates", error: error.message });
  }
};

export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate("party", "name symbol")
      .populate("constituency", "name");
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidate", error: error.message });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const { name, partyId, constituencyId } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (partyId) {
      const party = await Party.findById(partyId);
      if (!party) return res.status(404).json({ message: "Party not found" });
      updateFields.party = partyId;
    }
    if (constituencyId) {
      const constituency = await Constituency.findById(constituencyId);
      if (!constituency) return res.status(404).json({ message: "Constituency not found" });
      updateFields.constituency = constituencyId;
    }

    if (req.file) {
      // If a new file is uploaded, delete the old one and save the new one
      const oldCandidate = await Candidate.findById(req.params.id);
      if (oldCandidate && oldCandidate.image && oldCandidate.image.startsWith("/uploads/")) {
        const oldFilePath = path.join("uploads", oldCandidate.image.split("/uploads/")[1]);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      const fileName = `candidate_${Date.now()}_${req.file.originalname}`;
      const filePath = path.join("uploads", fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      updateFields.image = `/uploads/${fileName}`;
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updatedCandidate) return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json({ message: "Candidate updated successfully", candidate: updatedCandidate });
  } catch (error) {
    res.status(500).json({ message: "Error updating candidate", error: error.message });
  }
};

export const removeCandidate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const candidate = await Candidate.findById(req.params.id).session(session);
    if (!candidate) throw new Error("Candidate not found");

    await Constituency.findByIdAndUpdate(candidate.constituency, { $pull: { candidates: candidate._id } }, { session });
    await Candidate.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Candidate removed successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error removing candidate", error: error.message });
  }
};

export const incrementVote = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { $inc: { votes: 1 } }, { new: true });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.status(200).json({ message: "Vote recorded successfully", candidate });
  } catch (error) {
    res.status(500).json({ message: "Error updating vote", error: error.message });
  }
};
