const AppError = require("../utils/appError");
const { callProcedure, callProcedureAll } = require("../utils/procedure");
const { pool } = require("../config/db");

function shapeRating(row) {
    return {
        id: row.id,
        stars: row.stars,
        comment: row.comment,
        customerName: row.customer_name,
        createdAt: row.created_at
    };
}

async function addRating(customerId, { bookingId, stars, comment }) {
    const booking = await callProcedure("sp_get_booking", [bookingId]);
    if (!booking) throw new AppError("Booking not found", 404);
    if (String(booking.customer_id) !== String(customerId)) {
        throw new AppError("You can only rate your own bookings", 403);
    }

    const result = await callProcedure("sp_add_rating", [bookingId, customerId, stars, comment ?? null]);
    if (!result || !result.success) {
        throw new AppError(result?.message || "Unable to add rating", 400);
    }

    return { ratingId: result.ratingId };
}

// sp_get_provider_ratings returns two result sets (rating rows, then an
// average/count row) — callProcedureAll only exposes the first, so this
// call bypasses it and reads both sets directly.
async function getProviderRatings(providerId) {
    const [resultSets] = await pool.query("CALL sp_get_provider_ratings(?)", [providerId]);
    const ratingRows = Array.isArray(resultSets[0]) ? resultSets[0] : [];
    const summaryRow = Array.isArray(resultSets[1]) ? resultSets[1][0] : null;

    if (!summaryRow) throw new AppError("Provider not found", 404);

    return {
        ratings: ratingRows.map(shapeRating),
        average: summaryRow.average
    };
}

module.exports = { addRating, getProviderRatings };