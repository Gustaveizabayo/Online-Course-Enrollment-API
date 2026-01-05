"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_1 = __importDefault(require("passport"));
const prisma_1 = require("../database/prisma");
const bcrypt_1 = require("../utils/bcrypt");
const client_1 = require("@prisma/client");
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
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
        done(null, user);
    }
    catch (error) {
        done(error, undefined);
    }
}));
exports.default = passport_1.default;
