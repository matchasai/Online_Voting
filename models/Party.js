import mongoose from "mongoose";

const PartySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Party name is required"],
    trim: true,
    maxlength: [100, "Party name cannot exceed 100 characters"],
  },
  symbol: {
    type: String, // Stores Base64 image
    required: true,
  },
  manifesto: {
    type: String,
    required: [true, "Manifesto is required"],
    minlength: [10, "Manifesto should be at least 10 characters"],
  },
  founder: {
    type: String,
    required: [true, "Founder name is required"],
    trim: true,
  },
  foundedYear: {
    type: Number,
    required: [true, "Founded year is required"],
    min: 1800,
    max: new Date().getFullYear(),
  },
  ideology: {
    type: String,
    required: [true, "Ideology is required"],
    trim: true,
  },
  voteCount: { type: Number, default: 0 },
}, {
  timestamps: true,
  collation: { locale: 'en', strength: 2 }
});

const Party = mongoose.model("Party", PartySchema);
export default Party;
