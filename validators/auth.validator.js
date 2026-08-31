const { body } = require("express-validator");
const { validate } = require("../middleware/validate");

const registerRules = [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("phone")
        .trim()
        .matches(/^[0-9]{10,15}$/)
        .withMessage("Phone must be 10-15 digits"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    body("role")
        .isIn(["customer", "provider"])
        .withMessage("Role must be customer or provider"),
    validate
];

const emailRules = [
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    validate
];

const verifyOtpRules = [
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("otp")
        .trim()
        .matches(/^[0-9]{6}$/)
        .withMessage("OTP must be a 6-digit code"),
    validate
];

const loginRules = [
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validate
];

const refreshRules = [
    body("refreshToken").notEmpty().withMessage("refreshToken is required"),
    validate
];

module.exports = {
    registerRules,
    emailRules,
    verifyOtpRules,
    loginRules,
    refreshRules
};
