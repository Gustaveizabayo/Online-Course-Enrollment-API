"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const apiError_1 = require("../utils/apiError");
const env_1 = require("../config/env");
const errorHandler = (error, req, res, next) => {
    if (error instanceof apiError_1.ApiError) {
        return res.status(error.statusCode).json({
            message: error.message,
            error: error.name,
            statusCode: error.statusCode,
            ...(env_1.env.NODE_ENV === 'development' && { stack: error.stack }),
        });
    }
    // Handle unknown errors
    console.error('🔥 Unexpected error:', error);
    return res.status(500).json({
        message: 'Internal server error',
        error: 'InternalServerError',
        statusCode: 500,
        ...(env_1.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new apiError_1.ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
