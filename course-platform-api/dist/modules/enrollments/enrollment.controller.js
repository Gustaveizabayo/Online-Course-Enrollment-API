"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentController = void 0;
const enrollment_service_1 = require("./enrollment.service");
const enrollment_schema_1 = require("./enrollment.schema");
const apiError_1 = require("../../utils/apiError");
const enrollmentService = new enrollment_service_1.EnrollmentService();
class EnrollmentController {
    /**
     * @swagger
     * /api/enrollments:
     *   post:
     *     summary: Enroll in a course
     *     tags: [Enrollments]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - courseId
     *             properties:
     *               courseId:
     *                 type: string
     *                 format: uuid
     *     responses:
     *       201:
     *         description: Enrolled successfully
     *       400:
     *         description: Already enrolled or invalid request
     */
    async enroll(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('User not authenticated');
            }
            const validatedData = enrollment_schema_1.createEnrollmentSchema.parse(req.body);
            const enrollment = await enrollmentService.enrollStudent(req.user.id, validatedData.courseId);
            res.status(201).json(enrollment);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/enrollments/my-courses:
     *   get:
     *     summary: Get student's enrolled courses
     *     tags: [Enrollments]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of enrolled courses
     */
    async getStudentEnrollments(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('User not authenticated');
            }
            const enrollments = await enrollmentService.getStudentEnrollments(req.user.id);
            res.json(enrollments);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/enrollments/course/{courseId}:
     *   get:
     *     summary: Get enrollments for a course (instructor only)
     *     tags: [Enrollments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: courseId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of course enrollments
     *       403:
     *         description: Forbidden
     */
    async getCourseEnrollments(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('User not authenticated');
            }
            const { courseId } = req.params;
            const enrollments = await enrollmentService.getCourseEnrollments(courseId, req.user.id, req.user.role);
            res.json(enrollments);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EnrollmentController = EnrollmentController;
