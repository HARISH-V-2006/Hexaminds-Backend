const express = require("express");
const searchService = require("../services/search.service");
const { nearbySearchRules } = require("../validators/search.validator");

const router = express.Router();

router.get("/nearby", nearbySearchRules, async (req, res, next) => {
    try {
        res.status(200).json(await searchService.searchNearby(req.query));
    } catch (error) { next(error); }
});

router.get("/categories", async (req, res, next) => {
    try {
        res.status(200).json(await searchService.listCategories());
    } catch (error) { next(error); }
});

module.exports = router;
