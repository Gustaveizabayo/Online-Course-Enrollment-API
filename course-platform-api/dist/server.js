"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const startServer = async () => {
    try {
        const server = app_1.default.listen(env_1.env.PORT, () => {
            console.log(`
🚀 Server running in ${env_1.env.NODE_ENV} mode
📡 Listening on port ${env_1.env.PORT}
🔗 Base URL: ${env_1.env.BASE_URL}
📚 API Documentation: ${env_1.env.BASE_URL}/docs
🌍 Health Check: ${env_1.env.BASE_URL}/health
      `);
        });
        // Graceful shutdown
        const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
        signals.forEach(signal => {
            process.on(signal, () => {
                console.log(`\n${signal} received, shutting down gracefully...`);
                server.close(() => {
                    console.log('Server closed');
                    process.exit(0);
                });
            });
        });
        // Handle unhandled rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
