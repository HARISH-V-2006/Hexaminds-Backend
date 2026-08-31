function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || 500;
    const message =
        statusCode === 500 && process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.sqlMessage || err.message || "Internal server error";

    if (statusCode === 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message
    });
}

function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
}

module.exports = { errorHandler, notFoundHandler };
