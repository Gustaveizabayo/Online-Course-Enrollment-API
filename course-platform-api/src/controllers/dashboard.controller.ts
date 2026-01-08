import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  // Get platform dashboard (admin only)
  static async getAdminDashboard(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const dashboard = await DashboardService.getAdminDashboard();

      return res.json({
        success: true,
        dashboard
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get instructor dashboard
  static async getInstructorDashboard(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      // Check if user is instructor
      if (!user.isInstructor) {
        return res.status(403).json({ error: 'Instructor access required' });
      }

      const dashboard = await DashboardService.getInstructorDashboard(user.userId);

      return res.json({
        success: true,
        dashboard
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get student dashboard
  static async getStudentDashboard(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      const dashboard = await DashboardService.getStudentDashboard(user.userId);

      return res.json({
        success: true,
        dashboard
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get platform statistics (public)
  static async getPlatformStats(req: Request, res: Response) {
    try {
      const stats = await DashboardService.getPlatformStats();

      return res.json({
        success: true,
        stats: stats.overview
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
