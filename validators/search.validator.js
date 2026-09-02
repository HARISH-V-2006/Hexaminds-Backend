const { query } = require("express-validator");
const { validate } = require("../middleware/validate");

const nearbySearchRules = [
    query("lat")
        .exists().withMessage("lat is required").bail()
        .isFloat({ min: -90, max: 90 }).withMessage("lat must be between -90 and 90")
        .toFloat(),
    query("lng")
        .exists().withMessage("lng is required").bail()
        .isFloat({ min: -180, max: 180 }).withMessage("lng must be between -180 and 180")
        .toFloat(),
    query("radiusKm")
        .exists().withMessage("radiusKm is required").bail()
        .isFloat({ min: 0.1, max: 500 }).withMessage("radiusKm must be between 0.1 and 500")
        .toFloat(),
    query("category")
        .optional()
        .isInt({ min: 1 }).withMessage("category must be a positive integer id")
        .toInt(),
    validate
];

module.exports = { nearbySearchRules };
