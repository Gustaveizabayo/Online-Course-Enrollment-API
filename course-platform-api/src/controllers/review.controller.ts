import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';

export class ReviewController {
  // Add review
  static async addReview(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, rating, comment } = req.body;

      if (!courseId || !rating) {
        return res.status(400).json({ 
          error: 'Course ID and rating are required' 
        });
      }

      const review = await ReviewService.addReview(
        user.userId, 
        courseId, 
        rating, 
        comment,
        req
      );

      return res.status(201).json({
        success: true,
        message: 'Review added successfully',
        review
      });
    } catch (error: any) {
      if (error.message.includes('must be between') || 
          error.message.includes('must be enrolled') || 
          error.message.includes('already reviewed')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get course reviews
  static async getCourseReviews(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await ReviewService.getCourseReviews(id, page, limit);

      return res.json({
        success: true,
        ...result
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get my reviews
  static async getMyReviews(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const reviews = await ReviewService.getUserReviews(user.userId);

      return res.json({
        success: true,
        count: reviews.length,
        reviews
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update review
  static async updateReview(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!rating && !comment) {
        return res.status(400).json({ 
          error: 'Rating or comment is required for update' 
        });
      }

      const review = await ReviewService.updateReview(
        id, 
        user.userId, 
        rating, 
        comment,
        req
      );

      return res.json({
        success: true,
        message: 'Review updated successfully',
        review
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete review
  static async deleteReview(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const result = await ReviewService.deleteReview(id, user.userId, req);

      return res.json(result);
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get course rating statistics
  static async getCourseRatingStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await ReviewService.getCourseRatingStats(id);

      return res.json({
        success: true,
        stats
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
