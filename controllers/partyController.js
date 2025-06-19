import mongoose from "mongoose";
import Party from "../models/Party.js";


// ✅ Utility function for standardized responses
const handleResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data: Array.isArray(data) ? data : [] // Ensure data is always an array
  });
};
// ✅ Create a new party (Now storing image in MongoDB as Base64)
export const createParty = async (req, res) => {
  try {
    const { name, manifesto } = req.body;
    if (!req.file) return handleResponse(res, 400, "Party symbol image is required");

    const symbol = req.file.buffer.toString("base64"); // Convert image to Base64

    const existingParty = await Party.findOne({ name }).collation({ locale: "en", strength: 2 });
    if (existingParty) return handleResponse(res, 409, "Party name already exists");

    const newParty = await Party.create({ name, symbol, manifesto });
    handleResponse(res, 201, "Party created successfully", newParty);
  } catch (error) {
    console.error("Create Error:", error);
    handleResponse(res, 500, "Failed to create party");
  }
};

// ✅ Get all parties
export const getParties = async (req, res) => {
  try {
    const parties = await Party.find().select("-__v").lean();
    console.log("Parties retrieved:", parties);
    handleResponse(res, 200, "Parties retrieved successfully", parties);
  } catch (error) {
    console.error("Fetch Error:", error);
    handleResponse(res, 500, "Failed to fetch parties", []); // Ensure to send an empty array on error
  }
};



// ✅ Get a party by ID
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

// ✅ Update a party
export const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, manifesto } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleResponse(res, 400, "Invalid party ID format");
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (manifesto) updateFields.manifesto = manifesto;
    if (req.file) updateFields.symbol = req.file.buffer.toString("base64");

    const updatedParty = await Party.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true }).select("-__v");

    handleResponse(res, 200, "Party updated successfully", updatedParty);
  } catch (error) {
    console.error("Update Error:", error);
    handleResponse(res, 500, "Failed to update party");
  }
};

// ✅ Delete a party
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