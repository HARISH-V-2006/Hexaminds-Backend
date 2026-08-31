const { v4: uuidv4 } = require("uuid");
const AppError = require("../utils/appError");
const { callProcedure } = require("../utils/procedure");
const { sendOtpEmail } = require("../utils/mailer");
const {
    hashPassword,
    comparePassword,
    generateOtp,
    hashOtp,
    hashToken
} = require("../utils/hash");
const {
    signAccessToken,
    signRefreshToken,
    signTempToken,
    verifyRefreshToken,
    getRefreshExpiryDate
} = require("../utils/jwt");

function otpExpiryDate() {
    const minutes = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
    return new Date(Date.now() + minutes * 60 * 1000);
}

function tokenPayload(user) {
    return {
        userId: user.id || user.userId,
        email: user.email,
        role: user.role
    };
}

async function register({ name, email, phone, password, role }) {
    const userId = uuidv4();
    const passwordHash = await hashPassword(password);

    const result = await callProcedure("sp_register_user", [
        userId,
        name,
        email,
        phone,
        passwordHash,
        role
    ]);

    if (!result || !result.success) {
        throw new AppError(result?.message || "Unable to register user", 409);
    }

    return {
        userId: result.userId,
        message: result.message
    };
}

async function sendOtp({ email }) {
    const user = await callProcedure("sp_get_user_by_email", [email]);

    if (!user) {
        throw new AppError("No account found for this email", 404);
    }

    const otp = generateOtp();
    const expiresAt = otpExpiryDate();

    const result = await callProcedure("sp_save_otp", [
        uuidv4(),
        email,
        hashOtp(otp),
        expiresAt
    ]);

    if (!result || !result.success) {
        const status = result?.message?.includes("wait") ? 429 : 400;
        throw new AppError(result?.message || "Unable to send OTP", status);
    }

    await sendOtpEmail(email, otp, expiresAt);

    return {
        message: result.message,
        otpExpiresAt: new Date(result.otpExpiresAt).toISOString()
    };
}

async function verifyOtp({ email, otp }) {
    const result = await callProcedure("sp_verify_otp", [email, hashOtp(otp)]);

    if (!result || !result.success) {
        throw new AppError(result?.message || "Invalid or expired OTP", 400);
    }

    const tempToken = signTempToken({
        userId: result.userId,
        email,
        role: result.role,
        purpose: "otp_verified"
    });

    return {
        verified: true,
        tempToken
    };
}

async function login({ email, password }) {
    const user = await callProcedure("sp_get_user_by_email", [email]);

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const passwordOk = await comparePassword(password, user.password_hash);

    if (!passwordOk) {
        throw new AppError("Invalid email or password", 401);
    }

    if (!user.is_verified) {
        throw new AppError("Account is not verified. Please verify OTP first", 403);
    }

    const payload = tokenPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const saved = await callProcedure("sp_save_refresh_token", [
        uuidv4(),
        user.id,
        hashToken(refreshToken),
        getRefreshExpiryDate()
    ]);

    if (!saved || !saved.success) {
        throw new AppError("Unable to create session", 500);
    }

    return {
        accessToken,
        refreshToken,
        role: user.role
    };
}

async function refresh({ refreshToken }) {
    let decoded;

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const session = await callProcedure("sp_get_refresh_token", [hashToken(refreshToken)]);

    if (!session || session.user_id !== decoded.userId) {
        throw new AppError("Invalid refresh token", 401);
    }

    if (session.is_revoked) {
        throw new AppError("Refresh token has been revoked", 401);
    }

    if (new Date(session.expires_at).getTime() <= Date.now()) {
        throw new AppError("Refresh token has expired", 401);
    }

    const accessToken = signAccessToken({
        userId: session.user_id,
        email: session.email,
        role: session.role
    });

    return { accessToken };
}

async function logout({ refreshToken }) {
    try {
        verifyRefreshToken(refreshToken);
    } catch (error) {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const result = await callProcedure("sp_revoke_refresh_token", [hashToken(refreshToken)]);

    if (!result || !result.success) {
        throw new AppError(result?.message || "Unable to logout", 400);
    }

    return {
        message: result.message
    };
}

module.exports = {
    register,
    sendOtp,
    verifyOtp,
    login,
    refresh,
    logout
};
