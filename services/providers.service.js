const AppError = require("../utils/appError");
const { callProcedure, callProcedureAll } = require("../utils/procedure");

function shapeProvider(row) {
    return {
        id: row.provider_id,
        userId: row.user_id,
        name: row.provider_name,
        bio: row.bio,
        latitude: row.latitude,
        longitude: row.longitude,
        availability: row.availability,
        isVerified: !!row.is_verified,
        ratingAvg: row.rating_avg,
        ratingCount: row.rating_count,
        categories: row.category_names ? row.category_names.split(",") : [],
        createdAt: row.created_at
    };
}

async function createProvider(userId, { bio, latitude, longitude, categories }) {
    const result = await callProcedure("sp_create_provider", [
        userId,
        bio ?? null,
        latitude ?? null,
        longitude ?? null
    ]);

    if (!result || !result.success) {
        throw new AppError(result?.message || "Unable to create provider profile", 409);
    }

    const providerId = result.providerId;

    if (Array.isArray(categories) && categories.length > 0) {
        for (const categoryId of categories) {
            await callProcedure("sp_add_provider_category", [providerId, categoryId]);
        }
    }

    return { providerId };
}

async function getProviderById(providerId) {
    const row = await callProcedure("sp_get_provider_by_id", [providerId]);
    if (!row) throw new AppError("Provider not found", 404);
    return shapeProvider(row);
}

async function updateProvider(providerId, requestingUserId, { bio, latitude, longitude, availability, categories }) {
    // fetch first so we know who owns this profile before touching anything
    const existing = await callProcedure("sp_get_provider_by_id", [providerId]);
    if (!existing) throw new AppError("Provider not found", 404);

    if (String(existing.user_id) !== String(requestingUserId)) {
        throw new AppError("You can only update your own provider profile", 403);
    }

    const result = await callProcedure("sp_update_provider", [
        providerId,
        bio ?? null,
        latitude ?? null,
        longitude ?? null,
        availability ?? null
    ]);

    if (!result || result.rows_updated === 0) {
        throw new AppError("No changes made or provider not found", 404);
    }

    if (Array.isArray(categories)) {
        await callProcedure("sp_clear_provider_categories", [providerId]);
        for (const categoryId of categories) {
            await callProcedure("sp_add_provider_category", [providerId, categoryId]);
        }
    }

    return { updated: true };
}

async function listProviders({ category, minRating }) {
    const rows = await callProcedureAll("sp_list_providers", [
        category ?? null,
        minRating ?? null
    ]);
    return { providers: rows.map(shapeProvider) };
}

module.exports = { createProvider, getProviderById, updateProvider, listProviders };