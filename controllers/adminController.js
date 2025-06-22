import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Constituency from "../models/Constituency.js";
import District from "../models/District.js";
import Party from "../models/Party.js";
import User from "../models/User.js";

// ✅ Fetch all users with pagination and sorting
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { aadharNumber: searchRegex },
        { mobile: searchRegex },
      ];
    }

    console.log(`Fetching users: page=${page}, limit=${limit}, skip=${skip}, search='${search}'`);

    const users = await User.find(query, "-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    console.log("Total users:", totalUsers);
    console.log("Fetched users:", users.length);

    res.status(200).json({ users, totalUsers, currentPage: parseInt(page) });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// ✅ Secure Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { aadharNumber, password } = req.body;

    if (!process.env.AADHARNUM || !process.env.PASSWORD) {
      console.error("Admin credentials missing in environment variables");
      return res.status(500).json({ message: "Server misconfiguration. Admin credentials missing." });
    }

    if (aadharNumber !== process.env.AADHARNUM || password !== process.env.PASSWORD) {
      console.warn(`❌ Unauthorized Admin Login Attempt: ${aadharNumber}`);
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    try {
      const token = jwt.sign({ id: "admin", role: "admin" }, process.env.JWT_SECRET, { expiresIn: "12h" });
      return res.status(200).json({ message: "Admin login successful", token });
    } catch (tokenError) {
      console.error("❌ Token Generation Error:", tokenError);
      return res.status(500).json({ message: "Token generation failed. Please try again." });
    }
  } catch (error) {
    console.error("❌ Admin Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error. Please try again later." });
  }
};

// ✅ Fetch Dashboard Data (Users, Parties, Total Votes) - Enhanced with debugging
export const getAdminDashboard = async (req, res) => {
  try {
    console.log("Fetching dashboard data...");
    
    // Count voters only
    const userCount = await User.countDocuments({ role: "voter" });
    console.log("Voter count retrieved:", userCount);
    
    // Count parties
    const partyCount = await Party.countDocuments();
    console.log("Party count retrieved:", partyCount);
    
    // Aggregate total votes
    const totalVotesAgg = await Party.aggregate([
      { $group: { _id: null, total: { $sum: "$voteCount" } } }
    ]);
    console.log("Votes aggregation result:", JSON.stringify(totalVotesAgg));
    
    const totalVotes = totalVotesAgg[0]?.total || 0;
    
    // Get recent vote activity (bonus data)
    const recentVoters = await User.find({ hasVoted: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("name district constituency -_id");
    
    console.log("Dashboard data compiled successfully");
    
    res.status(200).json({ 
      userCount, 
      partyCount, 
      totalVotes,
      recentVoters
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
  }
};

// ✅ Fetch Vote Counts (Sorted by most votes)
export const getVotes = async (req, res) => {
  try {
    console.log("Fetching vote results...");
    const parties = await Party.find({}, "name symbol voteCount").sort({ voteCount: -1 });

    console.log(`Found ${parties.length} parties with votes`);
    
    if (!parties.length) {
      return res.status(404).json({ message: "No votes found" });
    }

    res.status(200).json({ voteResults: parties });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ message: "Error fetching votes", error: error.message });
  }
};

// ✅ Add New User
export const addUser = async (req, res) => {
  try {
    let { name, aadharNumber, mobile, age, gender, district, constituency, password, isAdmin } = req.body;

    name = name?.trim();
    aadharNumber = aadharNumber?.trim();
    mobile = mobile?.trim();
    district = district?.trim();
    constituency = constituency?.trim();
    password = password?.trim();

    if (!name || !aadharNumber || !mobile || !age || !gender || !district || !constituency || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (age < 18) return res.status(400).json({ message: "User must be at least 18 years old" });
    if (!/^\d{10}$/.test(mobile)) return res.status(400).json({ message: "Invalid mobile number. Must be 10 digits" });
    if (!/^\d{12}$/.test(aadharNumber)) return res.status(400).json({ message: "Invalid Aadhar number. Must be 12 digits" });

    const existingUser = await User.findOne({ $or: [{ aadharNumber }, { mobile }] });
    if (existingUser) return res.status(400).json({ message: "Aadhar Number or Mobile already exists" });

    const districtData = await District.findOne({ name: district });
    if (!districtData) return res.status(400).json({ message: `Invalid district: ${district}` });

    const constituencyExists = districtData.constituencies.some(c => c.name === constituency);
    if (!constituencyExists) return res.status(400).json({ message: `Invalid constituency: ${constituency} for district: ${district}` });

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = isAdmin ? "admin" : "voter";

    const newUser = new User({ name, aadharNumber, mobile, age, gender, district, constituency, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get Valid Districts & Constituencies
export const getValidDistricts = async (req, res) => {
  try {
    const districts = await District.find();

    if (!districts.length) {
      return res.status(200).json({ districts: [], constituencies: [] });
    }

    const validData = {
      districts: districts.map((d) => d.name),
      constituencies: districts.flatMap((d) => 
        d.constituencies ? d.constituencies.map((c) => c.name) : []
      ),
    };

    res.status(200).json(validData);
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, aadharNumber, mobile, age, gender, district, constituency, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    name = name?.trim();
    aadharNumber = aadharNumber?.trim();
    mobile = mobile?.trim();
    district = district?.trim();
    constituency = constituency?.trim();
    password = password?.trim();

    if (aadharNumber || mobile) {
      const existingUser = await User.findOne({ 
        $or: [
          { aadharNumber },
          { mobile }
        ],
        _id: { $ne: id }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Aadhar Number or Mobile already in use" });
      }
    }

    if (district && constituency) {
      const districtData = await District.findOne({ name: district });
      if (!districtData) {
        return res.status(400).json({ message: `Invalid district: ${district}` });
      }

      const constituencyExists = districtData.constituencies.some(c => c.name === constituency);
      if (!constituencyExists) {
        return res.status(400).json({ message: `Invalid constituency: ${constituency} for district: ${district}` });
      }
    }

    if (age && age < 18) {
      return res.status(400).json({ message: "User must be at least 18 years old" });
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number. Must be 10 digits" });
    }

    if (aadharNumber && !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({ message: "Invalid Aadhar number. Must be 12 digits" });
    }

    // Only update password if provided and not empty
    let hashedPassword = user.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    user.name = name || user.name;
    user.aadharNumber = aadharNumber || user.aadharNumber;
    user.mobile = mobile || user.mobile;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.district = district || user.district;
    user.constituency = constituency || user.constituency;
    user.password = hashedPassword;

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Reset All Votes: Set hasVoted to false for all users, and reset party, candidate, and NOTA votes
export const resetAllVotes = async (req, res) => {
  try {
    console.log("Resetting all votes...");
    // Reset user voting status
    const userResult = await User.updateMany({}, { $set: { hasVoted: false } });
    console.log(`Reset voting status for ${userResult.modifiedCount} users`);
    // Reset party vote counts
    const partyResult = await Party.updateMany({}, { $set: { voteCount: 0 } });
    console.log(`Reset vote counts for ${partyResult.modifiedCount} parties`);
    // Reset candidate vote counts
    const Candidate = (await import('../models/Candidate.js')).default;
    const candidateResult = await Candidate.updateMany({}, { $set: { votes: 0 } });
    console.log(`Reset vote counts for ${candidateResult.modifiedCount} candidates`);
    // Reset NOTA votes in all constituencies
    const notaResult = await Constituency.updateMany({}, { $set: { notaVotes: 0 } });
    console.log(`Reset NOTA votes for ${notaResult.modifiedCount} constituencies`);
    res.status(200).json({
      message: "All votes have been reset successfully!",
      usersReset: userResult.modifiedCount,
      partiesReset: partyResult.modifiedCount,
      candidatesReset: candidateResult.modifiedCount,
      notaReset: notaResult.modifiedCount
    });
  } catch (error) {
    console.error("Error resetting all votes:", error);
    res.status(500).json({ message: "Error occurred while resetting votes.", error: error.message });
  }
};

// ✅ Reset Vote for a Specific User
export const resetVote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { hasVoted: false }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ message: "User's vote has been reset successfully!" });
  } catch (error) {
    console.error("Error resetting vote:", error);
    res.status(500).json({ message: "Error occurred while resetting vote for the user.", error: error.message });
  }
};

// Get total number of users
export const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ message: "Server error while fetching total users.", error: error.message });
  }
};

// Get count of users who have voted
export const getVotedUsers = async (req, res) => {
  try {
    const votedUsers = await User.countDocuments({ hasVoted: true });
    res.status(200).json({ votedUsers });
  } catch (error) {
    console.error("Error fetching voted users:", error);
    res.status(500).json({ message: "Server error while fetching voted users.", error: error.message });
  }
};

// Get count of users who have not voted
export const getNonVotedUsers = async (req, res) => {
  try {
    const nonVotedUsers = await User.countDocuments({ hasVoted: false });
    res.status(200).json({ nonVotedUsers });
  } catch (error) {
    console.error("Error fetching non-voted users:", error);
    res.status(500).json({ message: "Server error while fetching non-voted users.", error: error.message });
  }
};

// Submit a vote
export const submitVote = async (req, res) => {
  try {
    const userId = req.user.id;  // Extract user ID from authMiddleware
    const { partyId } = req.body;  // Get selected party ID from request

    // Check if the user has already voted
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.hasVoted) {
      return res.status(400).json({ message: "You have already voted." });
    }

    // Find the party the user is voting for
    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(404).json({ message: "Party not found." });
    }

    // Record the vote by updating the party's vote count
    party.voteCount += 1;
    await party.save();

    // Update user's hasVoted status
    user.hasVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote submitted successfully!" });
  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).json({ message: "Server error while submitting vote.", error: error.message });
  }
};

// Votes trend by day (using User model's updatedAt)
export const getVotesTrend = async (req, res) => {
  try {
    const trend = await User.aggregate([
      { $match: { hasVoted: true } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          votes: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ trend });
  } catch (error) {
    res.status(500).json({ message: "Error fetching votes trend", error: error.message });
  }
};

// Top constituencies by turnout and NOTA
export const getTopConstituencies = async (req, res) => {
  try {
    const constituencies = await Constituency.find().populate("district");
    const data = await Promise.all(constituencies.map(async (c) => {
      const voters = await User.countDocuments({ constituency: c._id });
      const voted = await User.countDocuments({ constituency: c._id, hasVoted: true });
      return {
        name: c.name,
        district: c.district?.name || "",
        turnout: voters ? Math.round((voted / voters) * 100) : 0,
        nota: c.notaVotes || 0
      };
    }));
    const topTurnout = [...data].sort((a, b) => b.turnout - a.turnout).slice(0, 5);
    const topNota = [...data].sort((a, b) => b.nota - a.nota).slice(0, 5);
    res.json({ topTurnout, topNota });
  } catch (error) {
    res.status(500).json({ message: "Error fetching top constituencies", error: error.message });
  }
};

// Get top 25 candidates by votes
export const getTopCandidates = async (req, res) => {
  try {
    const topCandidates = await (await import('../models/Candidate.js')).default.find()
      .populate({ path: 'party', select: 'name' })
      .populate({ path: 'constituency', select: 'name' })
      .sort({ votes: -1 })
      .limit(25);
    const result = topCandidates.map(c => ({
      name: c.name,
      party: c.party?.name || '',
      constituency: c.constituency?.name || '',
      votes: c.votes
    }));
    res.status(200).json({ topCandidates: result });
  } catch (error) {
    res.status(500).json({ message: "Error fetching top candidates", error: error.message });
  }
};