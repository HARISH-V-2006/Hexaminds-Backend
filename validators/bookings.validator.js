const { body, param, query } = require("express-validator");
const { validate } = require("../middleware/validate");

const createBookingRules = [
    body("listingId").isInt({ min: 1 }).withMessage("listingId must be a positive integer"),
    body("scheduledAt").isISO8601().withMessage("scheduledAt must be a valid ISO 8601 datetime"),
    body("address").trim().notEmpty().isLength({ max: 255 }).withMessage("Address is required, max 255 characters"),
    validate
];

const bookingIdParamRules = [
    param("id").isInt({ min: 1 }).withMessage("Booking id must be a positive integer"),
    validate
];

const listBookingsQueryRules = [
    query("status").optional().isIn(["REQUESTED", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"])
        .withMessage("Invalid status filter"),
    validate
];

const updateBookingStatusRules = [
    param("id").isInt({ min: 1 }).withMessage("Booking id must be a positive integer"),
    body("status").isIn(["ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"])
        .withMessage("status must be one of ACCEPTED, REJECTED, COMPLETED, CANCELLED"),
    validate
];

module.exports = { createBookingRules, bookingIdParamRules, listBookingsQueryRules, updateBookingStatusRules };