import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },
  otp: {
    type: String,
    required: true,
    match: /^\d{6}$/
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 minutes in seconds
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
otpSchema.index({ mobile: 1, createdAt: -1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 }); // Auto delete after 10 minutes

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
