import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

// Ensure JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined. Please check your .env file.");
}

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access Denied. No Token Provided." });
    }

    // Extract Token
    const token = authHeader.split(" ")[1]?.trim();

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure Admin Privileges
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin Access Required." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid Token. Please provide a valid token." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    } else {
      return res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
  }
};

export default adminAuth;
