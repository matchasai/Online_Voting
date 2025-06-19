import mongoose from "mongoose";
import Candidate from "../models/Candidate.js";
import Constituency from "../models/Constituency.js";
import Party from "../models/Party.js";

// ✅ Add a new candidate (with transaction and uniqueness check)
export const addCandidate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, partyId, constituencyId } = req.body;

    if (!name || !partyId || !constituencyId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const party = await Party.findById(partyId).session(session);
    if (!party) throw new Error("Party not found");

    const constituency = await Constituency.findById(constituencyId).session(session);
    if (!constituency) throw new Error("Constituency not found");

    // Ensure unique candidate name in the same constituency
    const existingCandidate = await Candidate.findOne({ name, constituency: constituencyId }).session(session);
    if (existingCandidate) {
      throw new Error("Candidate with this name already exists in the constituency");
    }

    const newCandidate = new Candidate({ name, party: partyId, constituency: constituencyId });
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

// ✅ Get all candidates
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate("party", "name")
      .populate("constituency", "name");
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates", error: error.message });
  }
};

// ✅ Get candidate by ID
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate("party", "name")
      .populate("constituency", "name");
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidate", error: error.message });
  }
};

// ✅ Update a candidate
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

    const updatedCandidate = await Candidate.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updatedCandidate) return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json({ message: "Candidate updated successfully", candidate: updatedCandidate });
  } catch (error) {
    res.status(500).json({ message: "Error updating candidate", error: error.message });
  }
};

// ✅ Remove a candidate (with transaction)
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

// ✅ Increment Candidate Votes
export const incrementVote = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { $inc: { votes: 1 } }, { new: true });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.status(200).json({ message: "Vote recorded successfully", candidate });
  } catch (error) {
    res.status(500).json({ message: "Error updating vote", error: error.message });
  }
};
