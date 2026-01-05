"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    BASE_URL: zod_1.z.string().url(),
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    GOOGLE_CLIENT_ID: zod_1.z.string(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string(),
    GOOGLE_CALLBACK_URL: zod_1.z.string().url(),
    PAYPAL_CLIENT_ID: zod_1.z.string(),
    PAYPAL_CLIENT_SECRET: zod_1.z.string(),
    PAYPAL_ENVIRONMENT: zod_1.z.enum(['sandbox', 'production']).default('sandbox'),
});
exports.env = envSchema.parse(process.env);
