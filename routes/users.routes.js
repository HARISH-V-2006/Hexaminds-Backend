const express = require("express");
const usersService = require("../services/users.service");
const { authGuard } = require("../middleware/authGuard");
const { roleGuard } = require("../middleware/roleGuard");
const { updateMeRules, userIdParamRules, updateRoleRules } = require("../validators/users.validator");

const router = express.Router();

router.get("/me", authGuard, async (req, res, next) => {
    try {
        res.status(200).json(await usersService.getMyProfile(req.user.userId));
    } catch (error) { next(error); }
});

router.put("/me", authGuard, updateMeRules, async (req, res, next) => {
    try {
        res.status(200).json(await usersService.updateMyProfile(req.user.userId, req.body));
    } catch (error) { next(error); }
});

router.get("/:id", authGuard, roleGuard("admin"), userIdParamRules, async (req, res, next) => {
    try {
        res.status(200).json(await usersService.getUserById(req.params.id));
    } catch (error) { next(error); }
});

router.patch("/:id/role", authGuard, roleGuard("admin"), updateRoleRules, async (req, res, next) => {
    try {
        res.status(200).json(await usersService.updateUserRole(req.params.id, req.body.role));
    } catch (error) { next(error); }
});

module.exports = router;