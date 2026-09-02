const express = require("express");
const verificationService = require("../services/verification.service");
const { authGuard } = require("../middleware/authGuard");
const { roleGuard } = require("../middleware/roleGuard");
const {
    providerIdParamRules,
    toggleVerificationRules
} = require("../validators/verification.validator");

const router = express.Router();

router.post("/:providerId/toggle", authGuard, roleGuard("admin"), toggleVerificationRules, async (req, res, next) => {
    try {
        res.status(200).json(
            await verificationService.toggleVerification(req.params.providerId, req.user.userId, req.body.verified)
        );
    } catch (error) { next(error); }
});

router.get("/:providerId/status", authGuard, roleGuard("admin"), providerIdParamRules, async (req, res, next) => {
    try {
        res.status(200).json(await verificationService.getVerificationStatus(req.params.providerId));
    } catch (error) { next(error); }
});

router.get("/pending", authGuard, roleGuard("admin"), async (req, res, next) => {
    try {
        res.status(200).json(await verificationService.listPendingProviders());
    } catch (error) { next(error); }
});

module.exports = router;