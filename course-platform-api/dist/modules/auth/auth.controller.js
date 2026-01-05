"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_schema_1 = require("./auth.schema");
const apiError_1 = require("../../utils/apiError");
const authService = new auth_service_1.AuthService();
class AuthController {
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterInput'
     *     responses:
     *       201:
     *         description: User registered successfully
     *       400:
     *         description: Bad request
     */
    async register(req, res, next) {
        try {
            const validatedData = auth_schema_1.registerSchema.parse(req.body);
            const result = await authService.register(validatedData);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Login user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginInput'
     *     responses:
     *       200:
     *         description: Login successful
     *       401:
     *         description: Invalid credentials
     */
    async login(req, res, next) {
        try {
            const validatedData = auth_schema_1.loginSchema.parse(req.body);
            const result = await authService.login(validatedData);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/profile:
     *   get:
     *     summary: Get user profile
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile
     *       401:
     *         description: Unauthorized
     */
    async getProfile(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('User not authenticated');
            }
            const profile = await authService.getProfile(req.user.id);
            res.json(profile);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/profile:
     *   put:
     *     summary: Update user profile
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *     responses:
     *       200:
     *         description: Profile updated successfully
     *       401:
     *         description: Unauthorized
     */
    async updateProfile(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('User not authenticated');
            }
            const validatedData = auth_schema_1.updateProfileSchema.parse(req.body);
            const updatedProfile = await authService.updateProfile(req.user.id, validatedData);
            res.json(updatedProfile);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/google:
     *   get:
     *     summary: Start Google OAuth flow
     *     tags: [Auth]
     *     responses:
     *       302:
     *         description: Redirects to Google OAuth
     */
    async googleAuth(req, res, next) {
        // Handled by Passport middleware
    }
    /**
     * @swagger
     * /api/auth/google/callback:
     *   get:
     *     summary: Google OAuth callback
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: OAuth successful
     *       400:
     *         description: OAuth failed
     */
    async googleCallback(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('Google authentication failed');
            }
            const result = await authService.googleAuth(req.user);
            // Redirect with token in query parameter
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${result.token}`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
