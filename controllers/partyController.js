import mongoose from "mongoose";
import Party from "../models/Party.js";


const handleResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data: Array.isArray(data) ? data : []
  });
};
export const createParty = async (req, res) => {
  try {
    const { name, manifesto, founder, foundedYear, ideology } = req.body;
    if (!req.file) return handleResponse(res, 400, "Party symbol image is required");
    if (!name || !manifesto || !founder || !foundedYear || !ideology) {
      return handleResponse(res, 400, "All fields are required");
    }

    const symbol = req.file.buffer.toString("base64");

    const existingParty = await Party.findOne({ name }).collation({ locale: "en", strength: 2 });
    if (existingParty) return handleResponse(res, 409, "Party name already exists");

    const newParty = await Party.create({ name, symbol, manifesto, founder, foundedYear, ideology });
    handleResponse(res, 201, "Party created successfully", newParty);
  } catch (error) {
    console.error("Create Error:", error);
    handleResponse(res, 500, "Failed to create party");
  }
};

export const getParties = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const parties = await Party.find(query)
      .select("-__v")
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
      
    const totalParties = await Party.countDocuments(query);
    const totalPages = Math.ceil(totalParties / parseInt(limit));
    
    res.status(200).json({
      success: true,
      message: "Parties retrieved successfully",
      data: { parties, totalPages, currentPage: parseInt(page) }
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch parties", 
      data: { parties: [], totalPages: 0, currentPage: 1 } 
    });
  }
};

export const getPartyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return handleResponse(res, 400, "Invalid party ID format");

    const party = await Party.findById(id).select("-__v");
    if (!party) return handleResponse(res, 404, "Party not found");

    handleResponse(res, 200, "Party retrieved successfully", party);
  } catch (error) {
    console.error("Get Party Error:", error);
    handleResponse(res, 500, "Failed to retrieve party");
  }
};

export const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, manifesto, founder, foundedYear, ideology } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleResponse(res, 400, "Invalid party ID format");
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (manifesto) updateFields.manifesto = manifesto;
    if (founder) updateFields.founder = founder;
    if (foundedYear) updateFields.foundedYear = foundedYear;
    if (ideology) updateFields.ideology = ideology;
    if (req.file) updateFields.symbol = req.file.buffer.toString("base64");

    const updatedParty = await Party.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true }).select("-__v");

    handleResponse(res, 200, "Party updated successfully", updatedParty);
  } catch (error) {
    console.error("Update Error:", error);
    handleResponse(res, 500, "Failed to update party");
  }
};

export const deleteParty = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return handleResponse(res, 400, "Invalid party ID format");

    const party = await Party.findById(id);
    if (!party) return handleResponse(res, 404, "Party not found");

    await Party.findByIdAndDelete(id);
    handleResponse(res, 200, "Party deleted successfully");
  } catch (error) {
    console.error("Delete Error:", error);
    handleResponse(res, 500, "Failed to delete party");
  }
};