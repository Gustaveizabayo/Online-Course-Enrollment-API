import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate, requireInstructor } from '../middlewares/auth.middleware';
import path from 'path';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/upload/files:
 *   post:
 *     summary: Upload multiple files via URL (Instructor only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [fileUrl, fileName]
 *                   properties:
 *                     fileUrl:
 *                       type: string
 *                       format: uri
 *                     fileName:
 *                       type: string
 *                     fileSize:
 *                       type: integer
 *                       description: Size in bytes
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 */
router.post('/files', requireInstructor, UploadController.uploadFiles);

/**
 * @swagger
 * /api/upload/video:
 *   post:
 *     summary: Upload a video via URL (Instructor only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [videoUrl]
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to the video file
 *               fileName:
 *                 type: string
 *                 default: "video.mp4"
 *               fileSize:
 *                 type: integer
 *                 description: Size in bytes (optional)
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 */
router.post('/video', requireInstructor, UploadController.uploadVideo);

/**
 * @swagger
 * /api/upload/resource:
 *   post:
 *     summary: Upload a resource via URL (Instructor only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resourceUrl, fileName]
 *             properties:
 *               resourceUrl:
 *                 type: string
 *                 format: uri
 *               fileName:
 *                 type: string
 *               fileSize:
 *                 type: integer
 *                 description: Size in bytes (optional)
 *     responses:
 *       200:
 *         description: Resource uploaded successfully
 */
router.post('/resource', requireInstructor, UploadController.uploadResource);

/**
 * @swagger
 * /api/upload/thumbnail:
 *   post:
 *     summary: Upload a thumbnail via URL (Instructor only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [thumbnailUrl]
 *             properties:
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *               fileName:
 *                 type: string
 *                 default: "thumbnail.jpg"
 *     responses:
 *       200:
 *         description: Thumbnail uploaded successfully
 */
router.post('/thumbnail', requireInstructor, UploadController.uploadThumbnail);

// Serve uploaded files statically (for future use)
router.use('/uploads', (req, res, next) => {
  // Only allow access to authenticated users for security
  authenticate(req, res, next);
}, (req, res, next) => {
  // For now, return not implemented
  res.status(501).json({ 
    error: 'File upload via multipart/form-data not implemented yet',
    note: 'Use URL-based upload endpoints instead'
  });
});

export default router;
