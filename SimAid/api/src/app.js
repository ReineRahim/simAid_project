import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { healthCheck } from "./config/db.js";

// 🧩 Import route modules
import { userRoutes } from "./routes/userRoutes.js";
import { levelRoutes } from "./routes/levelRoutes.js";
import { scenarioRoutes } from "./routes/scenarioRoutes.js";
import { scenarioStepRoutes } from "./routes/scenarioStepRoutes.js";
import { badgeRoutes } from "./routes/badgesRoutes.js";
import { attemptRoutes } from "./routes/attemptRoutes.js";
import { userLevelRoutes } from "./routes/userLevelRoutes.js";
import { userBadgeRoutes } from "./routes/userBadgeRoutes.js";


dotenv.config();

export const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 🩺 Health check
app.get("/health", async (req, res) => {
  try {
    const ok = await healthCheck();
    res.json({ ok });
  } catch (e) {
    console.error("Health check failed:", e.message);
    res.status(500).json({ ok: false });
  }
});

// 🛣️ API Routes
app.use("/api/users", userRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/scenario-steps", scenarioStepRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/user-levels", userLevelRoutes);
app.use("/api/user-badges", userBadgeRoutes);


// 🧾 Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ⚙️ Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});
