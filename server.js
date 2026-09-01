const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const yaml = require("js-yaml");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const { testConnection } = require("./config/db");
const swaggerSpec = yaml.load(
    fs.readFileSync(path.join(__dirname, "swagger.yaml"), "utf8")
);
const authRoutes = require("./routes/auth.routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        message: "Hexaminds Backend is running!",
        docs: "/api-docs"
    });
});

app.get("/swagger.yaml", (req, res) => {
    res.type("text/yaml").send(
        fs.readFileSync(path.join(__dirname, "swagger.yaml"), "utf8")
    );
});

app.get("/swagger.json", (req, res) => {
    res.json(swaggerSpec);
});

const swaggerSetup = swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "Hexaminds API Docs"
});

app.get("/api-docs", swaggerSetup);
app.use("/api-docs", ...swaggerUi.serve, swaggerSetup);
app.use("/api/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await testConnection();
        console.log("MySQL connected");
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
        process.exit(1);
    }

    const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });

    server.on("error", (error) => {
        console.error("Server failed to start:", error.message);
        process.exit(1);
    });
}

start();
