const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");

const addRatingRules = [
    body("bookingId").isInt({ min: 1 }).withMessage("bookingId must be a positive integer"),
    body("stars").isInt({ min: 1, max: 5 }).withMessage("stars must be an integer from 1 to 5"),
    body("comment").optional().trim().isLength({ max: 500 }).withMessage("comment must be under 500 characters"),
    validate
];

const providerIdParamRules = [
    param("providerId").isInt({ min: 1 }).withMessage("Provider id must be a positive integer"),
    validate
];

module.exports = { addRatingRules, providerIdParamRules };