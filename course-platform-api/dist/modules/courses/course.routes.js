"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("./course.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const courseController = new course_controller_1.CourseController();
// Public routes
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
// Protected routes
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.INSTRUCTOR, client_1.Role.ADMIN), courseController.createCourse);
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.INSTRUCTOR, client_1.Role.ADMIN), courseController.updateCourse);
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.INSTRUCTOR, client_1.Role.ADMIN), courseController.deleteCourse);
// Instructor specific routes
router.get('/instructor/my-courses', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(client_1.Role.INSTRUCTOR, client_1.Role.ADMIN), courseController.getInstructorCourses);
exports.default = router;
