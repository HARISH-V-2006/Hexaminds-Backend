const crypto = require("crypto");
const bcrypt = require("bcryptjs");

function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

function comparePassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

function generateOtp() {
    return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp) {
    const pepper = process.env.OTP_PEPPER || "hexaminds-otp";
    return crypto.createHmac("sha256", pepper).update(String(otp)).digest("hex");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(String(token)).digest("hex");
}

module.exports = {
    hashPassword,
    comparePassword,
    generateOtp,
    hashOtp,
    hashToken
};
