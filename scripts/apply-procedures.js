require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

(async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: "utf8mb4_unicode_ci",
        multipleStatements: true,
        ssl: { rejectUnauthorized: false }
    });

    await connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

    const sqlPath = path.join(__dirname, "..", "database", "procedures.sql");
    let sql = fs.readFileSync(sqlPath, "utf8");
    sql = sql.replace(/^USE\s+\w+\s*;/gim, "");
    sql = sql.replace(/DELIMITER\s+\$\$/gi, "");
    sql = sql.replace(/DELIMITER\s+;/gi, "");

    const chunks = sql
        .split("$$")
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0);

    for (const chunk of chunks) {
        const statements = [];
        const createIdx = chunk.search(/CREATE PROCEDURE/i);

        if (createIdx === -1) {
            statements.push(...chunk.split(";").map((part) => part.trim()).filter(Boolean));
        } else {
            statements.push(
                ...chunk
                    .slice(0, createIdx)
                    .split(";")
                    .map((part) => part.trim())
                    .filter(Boolean)
            );
            statements.push(chunk.slice(createIdx).trim());
        }

        for (const statement of statements) {
            const preview = statement.replace(/\s+/g, " ").slice(0, 80);
            await connection.query(statement);
            console.log(`OK: ${preview}`);
        }
    }

    await connection.end();
    console.log("Procedures applied");
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
