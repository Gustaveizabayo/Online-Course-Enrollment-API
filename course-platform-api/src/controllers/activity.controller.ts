import { Request, Response } from 'express';
import { ActivityService } from '../services/activity.service';

export class ActivityController {
  // Get user activities
  static async getUserActivities(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await ActivityService.getUserActivities(user.userId, limit);

      return res.json({
        success: true,
        count: activities.length,
        activities
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get course activities
  static async getCourseActivities(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await ActivityService.getCourseActivities(courseId, limit);

      return res.json({
        success: true,
        count: activities.length,
        activities
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get platform activities (admin only)
  static async getPlatformActivities(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const activities = await ActivityService.getPlatformActivities(limit);

      return res.json({
        success: true,
        count: activities.length,
        activities
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
