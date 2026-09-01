const express = require("express");
const providersService = require("../services/providers.service");
const { authGuard } = require("../middleware/authGuard");
const {
    createProviderRules,
    providerIdParamRules,
    updateProviderRules,
    listProvidersQueryRules
} = require("../validators/providers.validator");

const router = express.Router();

router.post("/", authGuard, createProviderRules, async (req, res, next) => {
    try {
        res.status(201).json(await providersService.createProvider(req.user.userId, req.body));
    } catch (error) { next(error); }
});

router.get("/:id", providerIdParamRules, async (req, res, next) => {
    try {
        res.status(200).json(await providersService.getProviderById(req.params.id));
    } catch (error) { next(error); }
});

router.put("/:id", authGuard, updateProviderRules, async (req, res, next) => {
    try {
        res.status(200).json(await providersService.updateProvider(req.params.id, req.user.userId, req.body));
    } catch (error) { next(error); }
});

router.get("/", listProvidersQueryRules, async (req, res, next) => {
    try {
        res.status(200).json(await providersService.listProviders(req.query));
    } catch (error) { next(error); }
});

module.exports = router;