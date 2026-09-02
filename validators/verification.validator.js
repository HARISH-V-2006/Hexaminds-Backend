const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");

const providerIdParamRules = [
    param("providerId").isInt({ min: 1 }).withMessage("Provider id must be a positive integer"),
    validate
];

const toggleVerificationRules = [
    param("providerId").isInt({ min: 1 }).withMessage("Provider id must be a positive integer"),
    body("verified").isBoolean().withMessage("verified must be true or false").toBoolean(),
    validate
];

module.exports = { providerIdParamRules, toggleVerificationRules };