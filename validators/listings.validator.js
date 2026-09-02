const { body, param, query } = require("express-validator");
const { validate } = require("../middleware/validate");

const createListingRules = [
    body("categoryId").isInt({ min: 1 }).withMessage("categoryId must be a positive integer"),
    body("title").trim().notEmpty().isLength({ max: 150 }).withMessage("Title is required, max 150 characters"),
    body("description").optional().trim().isLength({ max: 2000 }).withMessage("Description must be under 2000 characters"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    validate
];

const listingIdParamRules = [
    param("id").isInt({ min: 1 }).withMessage("Listing id must be a positive integer"),
    validate
];

const updateListingRules = [
    param("id").isInt({ min: 1 }).withMessage("Listing id must be a positive integer"),
    body("title").optional().trim().isLength({ max: 150 }).withMessage("Title must be under 150 characters"),
    body("description").optional().trim().isLength({ max: 2000 }).withMessage("Description must be under 2000 characters"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    validate
];

const listListingsQueryRules = [
    query("category").optional().isInt({ min: 1 }).withMessage("category must be a positive integer id"),
    query("q").optional().trim().isLength({ max: 150 }).withMessage("q must be under 150 characters"),
    query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be a positive number"),
    query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be a positive number"),
    validate
];

module.exports = { createListingRules, listingIdParamRules, updateListingRules, listListingsQueryRules };