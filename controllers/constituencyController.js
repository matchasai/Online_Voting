import Constituency from "../models/Constituency.js";
import District from "../models/District.js";
import User from "../models/User.js";

export const addConstituency = async (req, res) => {
  try {
    const { name, districtId } = req.body;

    if (!name || !districtId) {
      return res.status(400).json({ message: "Name and District ID are required" });
    }

    // Check if district exists
    const districtExists = await District.findById(districtId);
    if (!districtExists) {
      return res.status(404).json({ message: "District not found" });
    }

    // Check if constituency already exists in the district
    const existingConstituency = await Constituency.findOne({ name, district: districtId });
    if (existingConstituency) {
      return res.status(400).json({ message: "Constituency already exists in this district" });
    }

    // Create new constituency
    const newConstituency = new Constituency({ name, district: districtId });
    await newConstituency.save();

    // Add reference to district
    districtExists.constituencies.push(newConstituency._id);
    await districtExists.save();

    res.status(201).json({
      message: "Constituency added successfully",
      constituency: newConstituency,
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getAllConstituencies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', district: districtId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (districtId) {
      query.district = districtId;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const constituencies = await Constituency.find(query)
      .populate("district", "name")
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalConstituencies = await Constituency.countDocuments(query);
    const totalPages = Math.ceil(totalConstituencies / limit);

    res.status(200).json({
      constituencies,
      totalPages,
      currentPage: parseInt(page),
      totalConstituencies,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getConstituencyById = async (req, res) => {
  try {
    const constituency = await Constituency.findById(req.params.id)
      .populate("district", "name")
      .populate({
        path: "candidates",
        populate: { path: "party", select: "name symbol" } // Include both party name and symbol
      });

    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    res.status(200).json(constituency);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateConstituency = async (req, res) => {
  try {
    const { name, districtId } = req.body;
    const constituencyId = req.params.id;

    if (!name || !districtId) {
      return res.status(400).json({ message: "Name and District ID are required" });
    }

    // Find the constituency
    const constituency = await Constituency.findById(constituencyId);
    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    const oldDistrictId = constituency.district.toString();
    if (oldDistrictId !== districtId) {
      // ✅ Remove from old district
      await District.findByIdAndUpdate(oldDistrictId, { $pull: { constituencies: constituencyId } });

      // ✅ Add to new district
      await District.findByIdAndUpdate(districtId, { $push: { constituencies: constituencyId } });
    }

    // ✅ Update the constituency
    const updatedConstituency = await Constituency.findByIdAndUpdate(
      constituencyId,
      { name, district: districtId },
      { new: true }
    );

    res.status(200).json({
      message: "Constituency updated successfully",
      constituency: updatedConstituency,
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteConstituency = async (req, res) => {
  try {
    const { id } = req.params;

    // Find constituency
    const constituency = await Constituency.findById(id);
    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    // ✅ Remove reference from district
    await District.findByIdAndUpdate(constituency.district, {
      $pull: { constituencies: id }
    });

    // ✅ Delete the constituency
    await Constituency.findByIdAndDelete(id);

    res.status(200).json({ message: "Constituency removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getTotalNotaVotes = async (req, res) => {
  try {
    const result = await Constituency.aggregate([
      { $group: { _id: null, totalNota: { $sum: "$notaVotes" } } }
    ]);
    res.status(200).json({ totalNota: result[0]?.totalNota || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching NOTA votes", error: error.message });
  }
};

// Get NOTA votes for a specific district
export const getNotaVotesByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;
    const constituencies = await Constituency.find({ district: districtId });
    const totalNota = constituencies.reduce((sum, c) => sum + (c.notaVotes || 0), 0);
    res.status(200).json({ totalNota });
  } catch (error) {
    res.status(500).json({ message: "Error fetching NOTA votes for district", error: error.message });
  }
};

// Get NOTA votes for a specific constituency
export const getNotaVotesByConstituency = async (req, res) => {
  try {
    const { constituencyId } = req.params;
    const constituency = await Constituency.findById(constituencyId);
    res.status(200).json({ notaVotes: constituency?.notaVotes || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching NOTA votes for constituency", error: error.message });
  }
};

// Get turnout for a specific district
export const getTurnoutByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;
    const users = await User.find({ district: districtId });
    const totalVoters = users.length;
    const voted = users.filter(u => u.hasVoted).length;
    const turnout = totalVoters ? Math.round((voted / totalVoters) * 100) : 0;
    res.status(200).json({ totalVoters, voted, turnout });
  } catch (error) {
    res.status(500).json({ message: "Error fetching turnout for district", error: error.message });
  }
};

// Get turnout for a specific constituency
export const getTurnoutByConstituency = async (req, res) => {
  try {
    const { constituencyId } = req.params;
    const users = await User.find({ constituency: constituencyId });
    const totalVoters = users.length;
    const voted = users.filter(u => u.hasVoted).length;
    const turnout = totalVoters ? Math.round((voted / totalVoters) * 100) : 0;
    res.status(200).json({ totalVoters, voted, turnout });
  } catch (error) {
    res.status(500).json({ message: "Error fetching turnout for constituency", error: error.message });
  }
};

// ✅ Get overall turnout
export const getOverallTurnout = async (req, res) => {
  try {
    const totalVoters = await User.countDocuments();
    const voted = await User.countDocuments({ hasVoted: true });
    const turnout = totalVoters > 0 ? Math.round((voted / totalVoters) * 100) : 0;
    res.status(200).json({ totalVoters, voted, turnout });
  } catch (error) {
    res.status(500).json({ message: "Error fetching overall turnout", error: error.message });
  }
};
