require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function stripClientCommands(sql) {
    return sql
        .replace(/CREATE DATABASE[\s\S]*?;/gi, "")
        .replace(/USE\s+\w+\s*;/gi, "")
        .replace(/DELIMITER\s+\$\$/gi, "")
        .replace(/DELIMITER\s*;/gi, "")
        .trim();
}

async function applySchema(connection) {
    const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
    const schema = stripClientCommands(fs.readFileSync(schemaPath, "utf8"));
    const statements = schema
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);

    for (const statement of statements) {
        try {
            await connection.query(statement);
        } catch (error) {
            if (
                error.code === "ER_TABLE_EXISTS_ERROR" ||
                error.code === "ER_FK_DUP_NAME" ||
                error.errno === 1050 ||
                error.errno === 1826 ||
                /already exists|duplicate foreign key/i.test(error.message)
            ) {
                continue;
            }
            throw error;
        }
    }

    console.log("Tables applied");
}

async function applyProcedures(connection) {
    const procPath = path.join(__dirname, "..", "database", "procedures.sql");
    const raw = stripClientCommands(fs.readFileSync(procPath, "utf8"));

    const drops = raw.match(/DROP PROCEDURE IF EXISTS \w+\s*;/gi) || [];
    for (const drop of drops) {
        await connection.query(drop);
    }

    const blocks = raw
        .split(/END\$\$/i)
        .map((block) => block.trim())
        .filter((block) => /CREATE PROCEDURE/i.test(block));

    for (const block of blocks) {
        await connection.query(`${block}\nEND`);
    }

    console.log(`Procedures applied (${blocks.length})`);
}

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 20000
    });

    console.log(`Connected to ${process.env.DB_HOST}/${process.env.DB_NAME}`);
    await applySchema(connection);
    await applyProcedures(connection);
    await connection.end();
    console.log("Database setup complete");
}

main().catch((error) => {
    console.error("Database setup failed:", error.message);
    process.exit(1);
});
