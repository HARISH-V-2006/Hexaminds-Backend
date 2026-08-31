const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Hexaminds Backend API",
            version: "1.0.0",
            description: "SIH26089 Auth / OTP APIs"
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: "Local server"
            }
        ],
        tags: [
            {
                name: "Auth",
                description: "Register, OTP, login, token refresh, and logout"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
