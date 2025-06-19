import mongoose from "mongoose";

const ConstituencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: false },
    district: { type: mongoose.Schema.Types.ObjectId, ref: "District", required: true },
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }],
    votersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Constituency", ConstituencySchema);
