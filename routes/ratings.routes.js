const express = require("express");
const ratingsService = require("../services/ratings.service");
const { authGuard } = require("../middleware/authGuard");
const { addRatingRules, providerIdParamRules } = require("../validators/ratings.validator");

const router = express.Router();

router.post("/", authGuard, addRatingRules, async (req, res, next) => {
    try {
        res.status(201).json(await ratingsService.addRating(req.user.userId, req.body));
    } catch (error) { next(error); }
});

router.get("/provider/:providerId", providerIdParamRules, async (req, res, next) => {
    try {
        res.status(200).json(await ratingsService.getProviderRatings(req.params.providerId));
    } catch (error) { next(error); }
});

module.exports = router;