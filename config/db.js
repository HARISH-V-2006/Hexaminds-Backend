const mysql = require("mysql2/promise");

const host = process.env.DB_HOST || "localhost";
const isLocal = host === "localhost" || host === "127.0.0.1";

const pool = mysql.createPool({
    host,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "hexaminds",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "Z",
    charset: "utf8mb4_unicode_ci",
    ssl: isLocal ? undefined : { rejectUnauthorized: false }
});

async function testConnection() {
    const connection = await pool.getConnection();
    connection.release();
}

module.exports = { pool, testConnection };
