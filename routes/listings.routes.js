const express = require("express");
const listingsService = require("../services/listings.service");
const { authGuard } = require("../middleware/authGuard");
const {
    createListingRules,
    listingIdParamRules,
    updateListingRules,
    listListingsQueryRules
} = require("../validators/listings.validator");

const router = express.Router();

router.post("/", authGuard, createListingRules, async (req, res, next) => {
    try {
        res.status(201).json(await listingsService.createListing(req.user.userId, req.body));
    } catch (error) { next(error); }
});

router.get("/:id", listingIdParamRules, async (req, res, next) => {
    try {
        res.status(200).json(await listingsService.getListingById(req.params.id));
    } catch (error) { next(error); }
});

router.put("/:id", authGuard, updateListingRules, async (req, res, next) => {
    try {
        res.status(200).json(await listingsService.updateListing(req.params.id, req.user.userId, req.body));
    } catch (error) { next(error); }
});

router.delete("/:id", authGuard, listingIdParamRules, async (req, res, next) => {
    try {
        res.status(200).json(await listingsService.deleteListing(req.params.id, req.user.userId, req.user.role));
    } catch (error) { next(error); }
});

router.get("/", listListingsQueryRules, async (req, res, next) => {
    try {
        res.status(200).json(await listingsService.listListings(req.query));
    } catch (error) { next(error); }
});

module.exports = router;