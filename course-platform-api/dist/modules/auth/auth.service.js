"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../../database/prisma");
const bcrypt_1 = require("../../utils/bcrypt");
const jwt_1 = require("../../utils/jwt");
const apiError_1 = require("../../utils/apiError");
const client_1 = require("@prisma/client");
class AuthService {
    async register(data) {
        const { email, password, name, role } = data;
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new apiError_1.BadRequestError('User with this email already exists');
        }
        // Hash password
        const hashedPassword = await (0, bcrypt_1.hashPassword)(password);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });
        // Generate token
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const token = (0, jwt_1.generateToken)(tokenPayload);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async login(data) {
        const { email, password } = data;
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new apiError_1.BadRequestError('Invalid credentials');
        }
        // Check if user has password (Google OAuth users might not have one)
        if (!user.password) {
            throw new apiError_1.BadRequestError('Please use Google OAuth to login');
        }
        // Verify password
        const isValidPassword = await (0, bcrypt_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            throw new apiError_1.BadRequestError('Invalid credentials');
        }
        // Generate token
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const token = (0, jwt_1.generateToken)(tokenPayload);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async getProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new apiError_1.NotFoundError('User not found');
        }
        return user;
    }
    async updateProfile(userId, data) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new apiError_1.NotFoundError('User not found');
        }
        // Check if email is being updated and if it's already taken
        if (data.email && data.email !== user.email) {
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingUser) {
                throw new apiError_1.BadRequestError('Email already in use');
            }
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return updatedUser;
    }
    async googleAuth(profile) {
        let user = await prisma_1.prisma.user.findUnique({
            where: { googleId: profile.id },
        });
        if (!user) {
            // Check if user exists with email
            user = await prisma_1.prisma.user.findUnique({
                where: { email: profile.emails?.[0].value || '' },
            });
            if (user) {
                // Link Google account to existing user
                user = await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: profile.id },
                });
            }
            else {
                // Create new user
                user = await prisma_1.prisma.user.create({
                    data: {
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails?.[0].value || '',
                        role: client_1.Role.STUDENT,
                        password: await (0, bcrypt_1.hashPassword)(Math.random().toString(36).slice(-8)),
                    },
                });
            }
        }
        // Generate token
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const token = (0, jwt_1.generateToken)(tokenPayload);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
}
exports.AuthService = AuthService;
