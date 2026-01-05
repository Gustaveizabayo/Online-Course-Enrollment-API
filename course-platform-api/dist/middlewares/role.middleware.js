"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const apiError_1 = require("../utils/apiError");
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new apiError_1.ForbiddenError('Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new apiError_1.ForbiddenError(`You don't have permission to access this resource`));
        }
        next();
    };
};
exports.authorize = authorize;
