const express = require("express");
const bookingsService = require("../services/bookings.service");
const { authGuard } = require("../middleware/authGuard");
const {
    createBookingRules,
    bookingIdParamRules,
    listBookingsQueryRules,
    updateBookingStatusRules
} = require("../validators/bookings.validator");

const router = express.Router();

router.post("/", authGuard, createBookingRules, async (req, res, next) => {
    try {
        res.status(201).json(await bookingsService.createBooking(req.user.userId, req.body));
    } catch (error) { next(error); }
});

router.get("/:id", authGuard, bookingIdParamRules, async (req, res, next) => {
    try {
        res.status(200).json(await bookingsService.getBookingById(req.params.id, req.user.userId, req.user.role));
    } catch (error) { next(error); }
});

router.get("/", authGuard, listBookingsQueryRules, async (req, res, next) => {
    try {
        res.status(200).json(await bookingsService.listBookings(req.user.userId, req.user.role, req.query.status));
    } catch (error) { next(error); }
});

router.patch("/:id/status", authGuard, updateBookingStatusRules, async (req, res, next) => {
    try {
        res.status(200).json(
            await bookingsService.updateBookingStatus(req.params.id, req.user.userId, req.user.role, req.body.status)
        );
    } catch (error) { next(error); }
});

module.exports = router;