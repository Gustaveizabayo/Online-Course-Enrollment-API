"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../database/prisma");
const apiError_1 = require("../utils/apiError");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new apiError_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
            },
        });
        if (!user) {
            throw new apiError_1.UnauthorizedError('User not found');
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(new apiError_1.UnauthorizedError('Invalid or expired token'));
    }
};
exports.authenticate = authenticate;
