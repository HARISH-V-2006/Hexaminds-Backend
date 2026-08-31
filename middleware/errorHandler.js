function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? "Internal server error" : err.message;

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
