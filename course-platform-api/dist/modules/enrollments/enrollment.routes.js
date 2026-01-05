"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enrollment_controller_1 = require("./enrollment.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const enrollmentController = new enrollment_controller_1.EnrollmentController();
// Student routes
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.STUDENT), enrollmentController.enroll);
router.get('/my-courses', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.STUDENT), enrollmentController.getStudentEnrollments);
// Instructor/Admin routes
router.get('/course/:courseId', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.INSTRUCTOR, client_1.Role.ADMIN), enrollmentController.getCourseEnrollments);
exports.default = router;
