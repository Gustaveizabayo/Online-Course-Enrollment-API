"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const passport_1 = __importDefault(require("../../config/passport"));
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
// Google OAuth routes
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), authController.googleCallback);
// Protected routes
router.get('/profile', auth_middleware_1.authenticate, authController.getProfile);
router.put('/profile', auth_middleware_1.authenticate, authController.updateProfile);
exports.default = router;
