const jwt = require("jsonwebtoken");

function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m"
    });
}

function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d"
    });
}

function signTempToken(payload) {
    return jwt.sign(payload, process.env.JWT_TEMP_SECRET || process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_TEMP_EXPIRES || "10m"
    });
}

function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function getRefreshExpiryDate() {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES || "7d";
    const now = Date.now();
    const amount = Number(expiresIn.slice(0, -1));

    if (expiresIn.endsWith("d")) {
        return new Date(now + amount * 24 * 60 * 60 * 1000);
    }
    if (expiresIn.endsWith("h")) {
        return new Date(now + amount * 60 * 60 * 1000);
    }
    if (expiresIn.endsWith("m")) {
        return new Date(now + amount * 60 * 1000);
    }

    return new Date(now + 7 * 24 * 60 * 60 * 1000);
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    signTempToken,
    verifyRefreshToken,
    verifyAccessToken,
    getRefreshExpiryDate
};