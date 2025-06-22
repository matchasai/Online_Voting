import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true },
  constituency: { type: mongoose.Schema.Types.ObjectId, ref: "Constituency", required: true },
  image: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

export default mongoose.model("Candidate", CandidateSchema);
