import { app } from './app.js';
import dotenv from 'dotenv';
import 'dotenv/config'; 

dotenv.config();

/**
 * 🌐 Application Entry Point
 *
 * This file initializes environment variables and starts the Express server.
 * It imports the configured Express `app` from `app.js` and begins listening
 * on the port defined in `.env` or defaults to port **4000**.
 *
 * @module server
 * @requires dotenv
 * @requires ./app.js
 */

// ✅ Load environment variables
const port = process.env.PORT || 4000;

/**
 * 🚀 Start the server
 *
 * Launches the Express application and logs the running URL to the console.
 *
 * @listens {http.Server} Express app instance
 * @example
 * # Example console output:
 * API http://localhost:4000
 */
app.listen(port, () => console.log(`API http://localhost:${port}`));
