"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
// Payment processing routes
router.post('/create', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.STUDENT), paymentController.createPayment);
router.post('/capture', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.STUDENT), paymentController.capturePayment);
// Callback routes (public)
router.get('/success', paymentController.paymentSuccess);
router.get('/cancel', paymentController.paymentCancel);
// Payment history routes
router.get('/my-payments', auth_middleware_1.authenticate, paymentController.getUserPayments);
router.get('/course/:courseId', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.INSTRUCTOR, client_1.Role.ADMIN), paymentController.getCoursePayments);
exports.default = router;
