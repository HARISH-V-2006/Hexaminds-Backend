const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");

const updateMeRules = [
    body("name").optional().trim().isLength({ min: 2, max: 100 }),
    body("phone").optional().trim().matches(/^[0-9]{10,15}$/),
    body("address").optional().trim().isLength({ min: 2, max: 255 }),
    validate
];

const userIdParamRules = [
    param("id").isInt({ min: 1 }),
    validate
];

const updateRoleRules = [
    param("id").isInt({ min: 1 }),
    body("role").isIn(["customer", "provider", "admin"]),
    validate
];

module.exports = { updateMeRules, userIdParamRules, updateRoleRules };