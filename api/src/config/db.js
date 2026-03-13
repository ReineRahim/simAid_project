import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

/**
 * Creates a MySQL connection pool using environment variables.
 *
 * Environment variables required:
 * - DB_HOST: Database host
 * - DB_PORT: Database port
 * - DB_USER: Database user
 * - DB_PASSWORD: Database user password
 * - DB_NAME: Database name
 *
 * The pool allows concurrent database operations
 * and should be reused across the application.
 */
const pool = mysql.createPool({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

/**
 * Performs a simple MySQL health check by running `SELECT 1`.
 *
 * @async
 * @function healthCheck
 * @returns {Promise<boolean>} Returns `true` if the database connection is healthy, otherwise `false`.
 * @example
 * const ok = await healthCheck();
 * if (!ok) {
 *   console.error("Database connection failed");
 * }
 */
export async function healthCheck() {
  try {
    const [rows] = await pool.query("SELECT 1");
    return true;
  } catch (error) {
    console.error("❌ MySQL health check failed:", error.message);
    return false;
  }
}

/**
 * Exports the MySQL connection pool for use throughout the application.
 * @type {import('mysql2/promise').Pool}
 */
export { pool };
