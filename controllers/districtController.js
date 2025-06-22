import Constituency from "../models/Constituency.js";
import District from "../models/District.js";

// ✅ Add a new district
export const addDistrict = async (req, res) => {
  try {
    const { name, state } = req.body;

    // Check if district already exists in the same state
    const existingDistrict = await District.findOne({ name, state });
    if (existingDistrict) {
      return res.status(400).json({ message: "District already exists in this state" });
    }

    // Create and save new district with empty constituencies and candidates
    const newDistrict = new District({
      name,
      state,
      constituencies: [],
      candidates: [],
    });

    await newDistrict.save();
    res.status(201).json({ message: "District added successfully", district: newDistrict });
  } catch (error) {
    res.status(500).json({ message: "Error adding district", error: error.message });
  }
};

// ✅ Get all districts with search
export const getAllDistricts = async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const districts = await District.find(query)
      .populate("constituencies", "name")
      .populate("candidates", "name")
      .sort({ name: 1 });

    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching districts", error: error.message });
  }
};

// ✅ Get district by ID
export const getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;
    const district = await District.findById(id)
      .populate("constituencies", "name")
      .populate("candidates", "name");

    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    res.status(200).json(district);
  } catch (error) {
    res.status(500).json({ message: "Error fetching district", error: error.message });
  }
};

// ✅ Update a district
export const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, state } = req.body;

    // Check if another district with the same name and state exists
    const existingDistrict = await District.findOne({ name, state, _id: { $ne: id } });
    if (existingDistrict) {
      return res.status(400).json({ message: "Another district with this name already exists in this state" });
    }

    // Update the district
    const updatedDistrict = await District.findByIdAndUpdate(
      id,
      { name, state },
      { new: true }
    ).populate("constituencies", "name")
     .populate("candidates", "name");

    if (!updatedDistrict) {
      return res.status(404).json({ message: "District not found" });
    }

    res.status(200).json({ message: "District updated successfully", district: updatedDistrict });
  } catch (error) {
    res.status(500).json({ message: "Error updating district", error: error.message });
  }
};

// ✅ Delete a district
export const removeDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if district exists
    const district = await District.findById(id);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    // Remove all constituencies and candidates under the district
    await Constituency.deleteMany({ district: id });

    // Delete the district
    await District.findByIdAndDelete(id);

    res.status(200).json({ message: "District and its constituencies removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing district", error: error.message });
  }
};
