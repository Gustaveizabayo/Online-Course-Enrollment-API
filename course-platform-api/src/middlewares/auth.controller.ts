import { Request, Response } from 'express';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

export class AuthController {
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
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *               - role
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 6
   *               role:
   *                 type: string
   *                 enum: [STUDENT, INSTRUCTOR]
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Bad request
   */
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      
      // Basic validation
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      
      if (!['STUDENT', 'INSTRUCTOR'].includes(role)) {
        return res.status(400).json({ error: 'Role must be STUDENT or INSTRUCTOR' });
      }
      
      // In a real app, you would:
      // 1. Hash the password
      // 2. Save to database
      // 3. Generate JWT token
      
      res.status(201).json({
        message: 'User registered successfully',
        user: { id: '123', name, email, role },
        token: 'dummy-jwt-token'
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
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
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // In a real app, you would:
      // 1. Find user by email
      // 2. Compare password hash
      // 3. Generate JWT token
      
      // Demo credentials
      const demoUsers = {
        'admin@example.com': { password: 'Admin123!', role: 'ADMIN', name: 'Admin User' },
        'student@example.com': { password: 'Student123!', role: 'STUDENT', name: 'Test Student' },
        'instructor@example.com': { password: 'Instructor123!', role: 'INSTRUCTOR', name: 'Test Instructor' }
      };
      
      const user = demoUsers[email];
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        message: 'Login successful',
        user: { 
          id: '123', 
          name: user.name, 
          email, 
          role: user.role 
        },
        token: 'dummy-jwt-token'
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
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
  async getProfile(req: Request, res: Response) {
    try {
      // In a real app, you would get user from JWT token
      res.json({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'STUDENT'
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}