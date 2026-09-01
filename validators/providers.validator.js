const { body, param, query } = require("express-validator");
const { validate } = require("../middleware/validate");

const createProviderRules = [
    body("bio").optional().trim().isLength({ max: 2000 }).withMessage("Bio must be under 2000 characters"),
    body("latitude").optional().isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),
    body("longitude").optional().isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),
    body("categories").optional().isArray().withMessage("Categories must be an array of category ids"),
    body("categories.*").optional().isInt({ min: 1 }).withMessage("Each category id must be a positive integer"),
    validate
];

const providerIdParamRules = [
    param("id").isInt({ min: 1 }).withMessage("Provider id must be a positive integer"),
    validate
];

const updateProviderRules = [
    param("id").isInt({ min: 1 }).withMessage("Provider id must be a positive integer"),
    body("bio").optional().trim().isLength({ max: 2000 }).withMessage("Bio must be under 2000 characters"),
    body("latitude").optional().isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),
    body("longitude").optional().isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),
    body("availability").optional().isIn(["available", "busy", "offline"]).withMessage("Availability must be available, busy, or offline"),
    body("categories").optional().isArray().withMessage("Categories must be an array of category ids"),
    body("categories.*").optional().isInt({ min: 1 }).withMessage("Each category id must be a positive integer"),
    validate
];

const listProvidersQueryRules = [
    query("category").optional().isInt({ min: 1 }).withMessage("category must be a positive integer id"),
    query("minRating").optional().isFloat({ min: 0, max: 5 }).withMessage("minRating must be between 0 and 5"),
    validate
];

module.exports = { createProviderRules, providerIdParamRules, updateProviderRules, listProvidersQueryRules };