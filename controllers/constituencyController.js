import Constituency from "../models/Constituency.js";
import District from "../models/District.js";

// ✅ Add a new constituency
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

// ✅ Get constituencies filtered by district (or all if no filter)
export const getAllConstituencies = async (req, res) => {
  try {
    const { district } = req.query;
    const query = district ? { district } : {}; // Filter if districtId is provided

    const constituencies = await Constituency.find(query)
      .populate("district", "name")
      .populate("candidates", "name party");

    res.status(200).json(constituencies);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Get a single constituency by ID
export const getConstituencyById = async (req, res) => {
  try {
    const constituency = await Constituency.findById(req.params.id)
      .populate("district", "name")
      .populate("candidates", "name party");

    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    res.status(200).json(constituency);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Update a constituency (update district reference if changed)
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

// ✅ Delete a constituency
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
