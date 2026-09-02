const AppError = require("../utils/appError");
const { callProcedure, callProcedureAll } = require("../utils/procedure");

function shapeBooking(row) {
    return {
        id: row.id,
        customerId: row.customer_id,
        providerId: row.provider_id,
        listingId: row.listing_id,
        scheduledAt: row.scheduled_at,
        address: row.address,
        status: row.status,
        createdAt: row.created_at
    };
}

async function resolveProviderId(userId) {
    const provider = await callProcedure("sp_get_provider_by_user_id", [userId]);
    return provider ? provider.provider_id : null;
}

async function createBooking(customerId, { listingId, scheduledAt, address }) {
    const result = await callProcedure("sp_create_booking", [customerId, listingId, scheduledAt, address]);

    if (!result || !result.success) {
        throw new AppError(result?.message || "Unable to create booking", 400);
    }

    return { bookingId: result.bookingId, status: result.status };
}

async function getBookingById(bookingId, requestingUserId, requestingUserRole) {
    const row = await callProcedure("sp_get_booking", [bookingId]);
    if (!row) throw new AppError("Booking not found", 404);

    if (requestingUserRole !== "admin") {
        const isCustomer = String(row.customer_id) === String(requestingUserId);
        const myProviderId = isCustomer ? null : await resolveProviderId(requestingUserId);
        const isProvider = myProviderId !== null && String(myProviderId) === String(row.provider_id);

        if (!isCustomer && !isProvider) {
            throw new AppError("You do not have access to this booking", 403);
        }
    }

    return {
        booking: shapeBooking(row),
        status: row.status,
        paymentStatus: row.payment_status ?? null
    };
}

async function listBookings(requestingUserId, requestingUserRole, status) {
    const rows = await callProcedureAll("sp_list_bookings", [
        requestingUserId,
        requestingUserRole,
        status ?? null
    ]);
    return { bookings: rows.map(shapeBooking) };
}

async function updateBookingStatus(bookingId, requestingUserId, requestingUserRole, newStatus) {
    const existing = await callProcedure("sp_get_booking", [bookingId]);
    if (!existing) throw new AppError("Booking not found", 404);

    if (requestingUserRole !== "admin") {
        const isCustomer = String(existing.customer_id) === String(requestingUserId);
        const myProviderId = isCustomer ? null : await resolveProviderId(requestingUserId);
        const isProvider = myProviderId !== null && String(myProviderId) === String(existing.provider_id);

        if (!isCustomer && !isProvider) {
            throw new AppError("You do not have access to this booking", 403);
        }
    }

    const result = await callProcedure("sp_update_booking_status", [bookingId, newStatus]);
    if (!result || result.rows_updated === 0) {
        throw new AppError("Booking not found", 404);
    }

    return { updated: true };
}

module.exports = { createBooking, getBookingById, listBookings, updateBookingStatus };