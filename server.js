import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
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
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(" Created 'uploads' directory.");
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
app.use("/api/admin", adminRoutes);

// ✅ API Health Check
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

const DATA_FILE = path.join(__dirname, "votingStart.json");

// Get voting start date/time
app.get("/api/voting/start", (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE));
      res.json(data);
    } else {
      res.json({ date: null, time: null });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to read voting start time." });
  }
});

// Set voting start date/time
app.post("/api/voting/start", (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) {
    return res.status(400).json({ error: "Date and time are required." });
  }
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ date, time }));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save voting start time." });
  }
});

const RESULTS_FILE = path.join(__dirname, "resultsTime.json");

// Get results declaration date/time
app.get("/api/results/time", (req, res) => {
  try {
    if (fs.existsSync(RESULTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(RESULTS_FILE));
      res.json(data);
    } else {
      res.json({ date: null, time: null });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to read results declaration time." });
  }
});

// Set results declaration date/time
app.post("/api/results/time", (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) {
    return res.status(400).json({ error: "Date and time are required." });
  }
  try {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify({ date, time }));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save results declaration time." });
  }
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
