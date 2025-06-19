import Party from "../models/Party.js";
import Candidate from "../models/Candidate.js";
import District from "../models/District.js";

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
