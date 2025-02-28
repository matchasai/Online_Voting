import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  aadhaar: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
  hasVoted: { type: Boolean, default: false },

});

export default mongoose.model("User", userSchema);
