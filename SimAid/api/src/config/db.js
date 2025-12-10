import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function healthCheck() {
  try {
    const [rows] = await pool.query("SELECT 1");
    return true;
  } catch (error) {
    console.error("❌ MySQL health check failed:", error.message);
    return false;
  }
}

export { pool };

