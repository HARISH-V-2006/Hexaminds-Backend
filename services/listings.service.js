const AppError = require("../utils/appError");
const { callProcedure, callProcedureAll } = require("../utils/procedure");

function shapeListingSummary(row) {
    return {
        id: row.listing_id,
        providerId: row.provider_id,
        providerName: row.provider_name,
        categoryId: row.category_id,
        categoryName: row.category_name,
        title: row.title,
        description: row.description,
        price: row.price,
        status: row.status,
        createdAt: row.created_at
    };
}

async function createListing(userId, { categoryId, title, description, price }) {
    const provider = await callProcedure("sp_get_provider_by_user_id", [userId]);
    if (!provider) throw new AppError("You must create a provider profile before listing a service", 403);

    const result = await callProcedure("sp_create_listing", [
        provider.provider_id,
        categoryId,
        title,
        description ?? null,
        price
    ]);

    if (!result || !result.success) {
        throw new AppError(result?.message || "Unable to create listing", 400);
    }

    return { listingId: result.listingId };
}

async function getListingById(listingId) {
    const row = await callProcedure("sp_get_listing_by_id", [listingId]);
    if (!row) throw new AppError("Listing not found", 404);

    return {
        listing: {
            id: row.listing_id,
            categoryId: row.category_id,
            categoryName: row.category_name,
            title: row.title,
            description: row.description,
            price: row.price,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        },
        providerSummary: {
            providerId: row.provider_id,
            userId: row.provider_user_id,
            name: row.provider_name,
            isVerified: !!row.provider_is_verified,
            ratingAvg: row.provider_rating_avg
        }
    };
}

async function updateListing(listingId, requestingUserId, { title, description, price }) {
    const existing = await callProcedure("sp_get_listing_by_id", [listingId]);
    if (!existing) throw new AppError("Listing not found", 404);

    if (String(existing.provider_user_id) !== String(requestingUserId)) {
        throw new AppError("You can only edit your own listings", 403);
    }

    const result = await callProcedure("sp_update_listing", [
        listingId,
        title ?? null,
        description ?? null,
        price ?? null
    ]);

    if (!result || result.rows_updated === 0) {
        throw new AppError("No changes made or listing not found", 404);
    }

    return { updated: true };
}

async function deleteListing(listingId, requestingUserId, requestingUserRole) {
    const existing = await callProcedure("sp_get_listing_by_id", [listingId]);
    if (!existing) throw new AppError("Listing not found", 404);

    const isOwner = String(existing.provider_user_id) === String(requestingUserId);
    if (!isOwner && requestingUserRole !== "admin") {
        throw new AppError("You can only delete your own listings", 403);
    }

    const result = await callProcedure("sp_delete_listing", [listingId]);
    if (!result || result.rows_deleted === 0) {
        throw new AppError("Listing not found", 404);
    }

    return { deleted: true };
}

async function listListings({ category, q, minPrice, maxPrice }) {
    const rows = await callProcedureAll("sp_list_listings", [
        category ?? null,
        q ?? null,
        minPrice ?? null,
        maxPrice ?? null
    ]);
    const listings = rows.map(shapeListingSummary);
    return { listings, count: listings.length };
}

module.exports = { createListing, getListingById, updateListing, deleteListing, listListings };