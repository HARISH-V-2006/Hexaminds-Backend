const AppError = require("../utils/appError");
const { verifyAccessToken } = require("../utils/jwt");

function authGuard(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return next(new AppError("Missing or invalid Authorization header", 401));
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
        next();
    } catch (error) {
        next(new AppError("Invalid or expired access token", 401));
    }
}

module.exports = { authGuard };