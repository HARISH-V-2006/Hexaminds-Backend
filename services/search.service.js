const { callProcedureAll } = require("../utils/procedure");

function toNumber(value, digits) {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    if (Number.isNaN(n)) return null;
    return digits === undefined ? n : Number(n.toFixed(digits));
}

function shapeNearbyResult(row) {
    return {
        providerId: row.provider_id,
        providerName: row.provider_name,
        isVerified: !!row.is_verified,
        ratingAvg: toNumber(row.rating_avg, 2),
        latitude: toNumber(row.latitude, 8),
        longitude: toNumber(row.longitude, 8),
        listingId: row.listing_id,
        title: row.title,
        price: toNumber(row.price, 2),
        categoryName: row.category_name,
        distanceKm: toNumber(row.distance_km, 2)
    };
}

function shapeCategory(row) {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug
    };
}

async function searchNearby({ lat, lng, radiusKm, category }) {
    const rows = await callProcedureAll("sp_search_nearby", [
        lat,
        lng,
        radiusKm,
        category ?? null
    ]);
    return { results: rows.map(shapeNearbyResult) };
}

async function listCategories() {
    const rows = await callProcedureAll("sp_get_categories");
    return { categories: rows.map(shapeCategory) };
}

module.exports = { searchNearby, listCategories };
