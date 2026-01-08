import { PrismaClient, ActivityType } from '@prisma/client';
import { ActivityService } from './activity.service';
import { Request } from 'express';

const prisma = new PrismaClient();

export class ReviewService {
  // Add review for a course
  static async addReview(
    userId: string, 
    courseId: string, 
    rating: number, 
    comment?: string,
    req?: Request
  ) {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (!enrollment) {
      throw new Error('You must be enrolled in the course to leave a review');
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingReview) {
      throw new Error('You have already reviewed this course');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        courseId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.REVIEW_CREATED,
      userId,
      courseId,
      details: {
        rating,
        comment,
        courseTitle: review.course.title
      },
      req
    });

    console.log(`â­ Review added: ${review.user.name} rated "${review.course.title}" ${rating} stars`);
    
    return review;
  }

  // Get course reviews
  static async getCourseReviews(courseId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              name: true,
              profileImage: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: { courseId }
      })
    ]);

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true }
    });

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      averageRating: avgRating._avg.rating || 0
    };
  }

  // Get user reviews
  static async getUserReviews(userId: string) {
    return prisma.review.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
            thumbnail: true,
            instructor: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Update review
  static async updateReview(
    reviewId: string, 
    userId: string, 
    rating?: number, 
    comment?: string,
    req?: Request
  ) {
    // Check if review exists and belongs to user
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!review) {
      throw new Error('Review not found or access denied');
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating || review.rating,
        comment: comment !== undefined ? comment : review.comment
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.REVIEW_CREATED, // Reusing type for update
      userId,
      courseId: review.course.id,
      details: {
        action: 'updated',
        rating: updatedReview.rating,
        previousRating: review.rating,
        courseTitle: review.course.title
      },
      req
    });

    console.log(`âœï¸ Review updated: ${updatedReview.rating} stars for "${review.course.title}"`);
    
    return updatedReview;
  }

  // Delete review
  static async deleteReview(reviewId: string, userId: string, req?: Request) {
    // Check if review exists and belongs to user
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!review) {
      throw new Error('Review not found or access denied');
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.REVIEW_CREATED, // Reusing type for delete
      userId,
      courseId: review.course.id,
      details: {
        action: 'deleted',
        rating: review.rating,
        courseTitle: review.course.title
      },
      req
    });

    console.log(`í·‘ï¸ Review deleted: "${review.course.title}"`);
    
    return { success: true, message: 'Review deleted successfully' };
  }

  // Get course rating statistics
  static async getCourseRatingStats(courseId: string) {
    const reviews = await prisma.review.findMany({
      where: { courseId }
    });

    const ratingCounts = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    reviews.forEach(review => {
      ratingCounts[review.rating as keyof typeof ratingCounts]++;
    });

    const total = reviews.length;
    const average = total > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0;

    return {
      totalReviews: total,
      averageRating: Math.round(average * 10) / 10,
      ratingDistribution: ratingCounts,
      percentageByStar: Object.keys(ratingCounts).reduce((acc, star) => {
        acc[star] = total > 0 ? (ratingCounts[parseInt(star) as keyof typeof ratingCounts] / total) * 100 : 0;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
