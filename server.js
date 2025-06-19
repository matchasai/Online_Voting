import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import constituencyRoutes from "./routes/constituencyRoutes.js"; // ✅ Fixed import name
import districtRoutes from "./routes/districtRoutes.js";
import partyRoutes from "./routes/partyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";

dotenv.config();
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ensure 'uploads' directory exists
import fs from "fs";
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Created 'uploads' directory.");
}

// ✅ Serve static files correctly
app.use("/uploads", express.static(uploadsPath));

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Update with actual frontend URL
    credentials: true, 
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// ✅ Correct API Route Paths
app.use("/api/user", userRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/constituencies", constituencyRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/parties", partyRoutes);
app.use("/admin", adminRoutes);

// ✅ API Health Check
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
