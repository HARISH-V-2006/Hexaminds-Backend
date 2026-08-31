const express = require("express");
const authService = require("../services/auth.service");
const {
    registerRules,
    emailRules,
    verifyOtpRules,
    loginRules,
    refreshRules
} = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", registerRules, async (req, res, next) => {
    try {
        const data = await authService.register(req.body);
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/otp/send", emailRules, async (req, res, next) => {
    try {
        const data = await authService.sendOtp(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/otp/verify", verifyOtpRules, async (req, res, next) => {
    try {
        const data = await authService.verifyOtp(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/login", loginRules, async (req, res, next) => {
    try {
        const data = await authService.login(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/refresh", refreshRules, async (req, res, next) => {
    try {
        const data = await authService.refresh(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

router.post("/logout", refreshRules, async (req, res, next) => {
    try {
        const data = await authService.logout(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
