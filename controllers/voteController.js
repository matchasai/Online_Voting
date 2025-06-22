import mongoose from "mongoose";
import Candidate from "../models/Candidate.js";
import Constituency from "../models/Constituency.js";
import District from "../models/District.js";
import Party from "../models/Party.js";
import User from "../models/User.js";

// Get vote counts for all parties
export const getAllPartyVotes = async (req, res) => {
  try {
    const parties = await Party.find().select("name voteCount");

    res.status(200).json({ message: "Votes fetched successfully", parties });
  } catch (error) {
    res.status(500).json({ message: "Error fetching votes", error: error.message });
  }
};

export const getVotesByPartyInDistrict = async (req, res) => {
  try {
    const { partyId, districtId } = req.params;

    // Validate District
    const district = await District.findById(districtId);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    // Find candidates of the party in the given district
    const candidates = await Candidate.find({ party: partyId, constituency: { $in: district.constituencies } });

    if (!candidates.length) {
      return res.status(404).json({ message: "No candidates found for this party in the district" });
    }

    // Sum up votes
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);

    res.status(200).json({ partyId, districtId, totalVotes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching votes", error: error.message });
  }
};


export const getVotesByCandidateInParty = async (req, res) => {
  try {
    const { partyId } = req.params;

    // Find all candidates belonging to this party
    const candidates = await Candidate.find({ party: partyId }).populate("constituency");

    if (!candidates.length) {
      return res.status(404).json({ message: "No candidates found for this party" });
    }

    // Format response
    const candidateVotes = candidates.map((candidate) => ({
      candidateId: candidate._id,
      candidateName: candidate.name,
      constituency: candidate.constituency.name,
      votes: candidate.votes,
    }));

    res.status(200).json({ partyId, candidates: candidateVotes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching votes", error: error.message });
  }
};

// Cast a new vote (Final, simplified, and robust version)
export const castVote = async (req, res) => {
  const { candidateId, constituencyId, isNota } = req.body;
  const userId = req.user.id;

  // 1. Validate all inputs
  if (!userId) {
    return res.status(401).json({ message: "Not authorized. User ID is missing." });
  }
  if (isNota && !mongoose.Types.ObjectId.isValid(constituencyId)) {
    return res.status(400).json({ message: "Invalid Constituency ID for NOTA vote." });
  }
  if (!isNota && !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.status(400).json({ message: "Invalid Candidate ID." });
  }

  try {
    // 2. Check if user has already voted
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.hasVoted) {
      return res.status(400).json({ message: "You have already voted." });
    }

    // 3. Atomically update vote counts
    if (isNota) {
      await Constituency.findByIdAndUpdate(constituencyId, { $inc: { notaVotes: 1 } });
    } else {
      // Find candidate to get their party
      const candidate = await Candidate.findById(candidateId).lean(); // .lean() for speed
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found." });
      }
      
      // Use $inc for atomic updates
      await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });
      await Party.findByIdAndUpdate(candidate.party, { $inc: { voteCount: 1 } });
    }

    // 4. Mark user as voted
    user.hasVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote cast successfully." });

  } catch (error) {
    console.error("VOTE CASTING FAILED:", error);
    res.status(500).json({ message: "A critical server error occurred. Please try again.", error: error.message });
  }
};
