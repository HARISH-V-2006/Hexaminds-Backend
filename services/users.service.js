const AppError = require("../utils/appError");
const { callProcedure } = require("../utils/procedure");

async function getMyProfile(userId) {
    const user = await callProcedure("sp_get_user_profile", [userId]);
    if (!user) throw new AppError("User not found", 404);
    return user;
}

async function updateMyProfile(userId, { name, phone, address }) {
    const result = await callProcedure("sp_update_user_profile", [
        userId, name ?? null, phone ?? null, address ?? null
    ]);
    if (!result || result.rows_updated === 0) throw new AppError("No changes made or user not found", 404);
    return { updated: true };
}

async function getUserById(userId) {
    const user = await callProcedure("sp_get_user_profile", [userId]);
    if (!user) throw new AppError("User not found", 404);
    return user;
}

async function updateUserRole(userId, role) {
    const result = await callProcedure("sp_update_user_role", [userId, role]);
    if (!result || result.rows_updated === 0) throw new AppError("User not found", 404);
    return { updated: true };
}

module.exports = { getMyProfile, updateMyProfile, getUserById, updateUserRole };