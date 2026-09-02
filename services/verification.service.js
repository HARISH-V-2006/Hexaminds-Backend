const AppError = require("../utils/appError");
const { callProcedure, callProcedureAll } = require("../utils/procedure");

function shapeVerificationStatus(row) {
    return {
        providerId: row.provider_id,
        verified: !!row.is_verified,
        verifiedBy: row.verified_by,
        verifiedByName: row.verified_by_name,
        verifiedAt: row.verified_at
    };
}

function shapePendingProvider(row) {
    return {
        providerId: row.provider_id,
        userId: row.user_id,
        name: row.provider_name,
        email: row.email,
        bio: row.bio,
        latitude: row.latitude,
        longitude: row.longitude,
        createdAt: row.created_at
    };
}

async function toggleVerification(providerId, adminId, verified) {
    const result = await callProcedure("sp_toggle_provider_verification", [
        providerId,
        verified ? 1 : 0,
        adminId
    ]);

    if (!result || !result.success) {
        throw new AppError(result?.message || "Provider not found", 404);
    }

    return {
        providerId: result.providerId,
        verified: !!result.verified,
        verifiedAt: result.verifiedAt
    };
}

async function getVerificationStatus(providerId) {
    const row = await callProcedure("sp_get_provider_verification_status", [providerId]);
    if (!row) throw new AppError("Provider not found", 404);
    return shapeVerificationStatus(row);
}

async function listPendingProviders() {
    const rows = await callProcedureAll("sp_get_pending_providers");
    return { pendingProviders: rows.map(shapePendingProvider) };
}

module.exports = { toggleVerification, getVerificationStatus, listPendingProviders };