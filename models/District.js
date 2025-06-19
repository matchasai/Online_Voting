import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    constituencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Constituency", default: [] }],
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate", default: [] }],
  },
  { timestamps: true }
);

const District = mongoose.model("District", districtSchema);
export default District;
