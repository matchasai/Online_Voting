import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    aadharNumber: { type: String, required: true, unique: true, minlength: 12, maxlength: 12 },
    mobile: { type: String, required: true, unique: true, minlength: 10, maxlength: 10 },
    age: { type: Number, required: true, min: 18 },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    district: { type: mongoose.Schema.Types.ObjectId, ref: "District", required: true },
    constituency: { type: mongoose.Schema.Types.ObjectId, ref: "Constituency", required: true },
    password: { type: String, required: true, select: false },
    hasVoted: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("User", UserSchema);
