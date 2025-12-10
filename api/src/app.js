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

/**
 * Express application setup.
 *
 * This file configures and initializes the Express app instance,
 * applies middlewares, mounts all API route modules, and defines
 * global error-handling and health-check logic.
 *
 * @module app
 * @requires express
 * @requires cors
 * @requires dotenv
 * @requires ./config/db.js
 * @requires ./routes/userRoutes.js
 * @requires ./routes/levelRoutes.js
 * @requires ./routes/scenarioRoutes.js
 * @requires ./routes/scenarioStepRoutes.js
 * @requires ./routes/badgesRoutes.js
 * @requires ./routes/attemptRoutes.js
 * @requires ./routes/userLevelRoutes.js
 * @requires ./routes/userBadgeRoutes.js
 */
export const app = express();

/**
 * ✅ Core middlewares
 * - `express.json()` for parsing JSON request bodies
 * - `express.urlencoded()` for form data
 * - `cors()` for enabling Cross-Origin Resource Sharing
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/**
 * 🩺 Health check endpoint
 * Provides a simple way to confirm that the API and database
 * connection are working correctly.
 *
 * @route GET /health
 * @returns {object} `{ ok: true }` if the database connection succeeds, or `{ ok: false }` otherwise.
 */
app.get("/health", async (req, res) => {
  try {
    const ok = await healthCheck();
    res.json({ ok });
  } catch (e) {
    console.error("Health check failed:", e.message);
    res.status(500).json({ ok: false });
  }
});

/**
 * 🛣️ Main API route registration
 * All routes are namespaced under `/api/...`
 */
app.use("/api/users", userRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/scenario-steps", scenarioStepRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/user-levels", userLevelRoutes);
app.use("/api/user-badges", userBadgeRoutes);

/**
 * 🧾 Fallback handler for unknown routes
 * Returns a standardized JSON 404 response.
 *
 * @returns {object} `{ message: "Route not found" }`
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * ⚙️ Global error handler
 * Logs and returns a consistent 500 response for uncaught errors.
 *
 * @param {Error} err - The error object.
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {object} JSON error payload `{ message, error }`.
 */
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});
