import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma.service';
import { Role } from '@prisma/client';

export class AuthPrismaService {
  static async register(name: string, email: string, password: string, role: Role = Role.STUDENT) {
    try {
      console.log('Prisma AuthService: Registering user:', email);
      
      // Check if user exists using Prisma
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed with Prisma');

      // Create user with Prisma
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      console.log('Prisma user created with ID:', user.id);

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key-123',
        { expiresIn: '7d' }
      );

      return { user, token };
      
    } catch (error: any) {
      console.error('Prisma AuthService register error:', error);
      throw error;
    }
  }

  static async login(email: string, password: string) {
    try {
      // Find user with Prisma
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true
        }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key-123',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
      
    } catch (error: any) {
      console.error('Prisma AuthService login error:', error);
      throw error;
    }
  }
}
