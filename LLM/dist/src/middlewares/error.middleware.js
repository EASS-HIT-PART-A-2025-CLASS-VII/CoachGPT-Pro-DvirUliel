"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (error, req, res, _next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    }
    else if (error.message?.includes('ECONNREFUSED')) {
        statusCode = 503;
        message = 'External service unavailable';
    }
    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`, {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    const errorResponse = {
        success: false,
        error: {
            message,
            statusCode,
            timestamp: new Date().toISOString(),
            path: req.path
        }
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = error.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const notFound = (req, res, next) => {
    const error = new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=error.middleware.js.map