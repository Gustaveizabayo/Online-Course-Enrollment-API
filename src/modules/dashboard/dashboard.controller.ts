import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { ApiResponse } from '../../types';
import { Role } from '@prisma/client';

export class DashboardController {
    async getDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            let data;

            switch (user.role) {
                case Role.INSTRUCTOR:
                    data = await dashboardService.getInstructorStats(user.id);
                    break;
                case Role.ADMIN:
                    data = await dashboardService.getAdminStats();
                    break;
                case Role.STUDENT:
                default:
                    data = await dashboardService.getStudentStats(user.id);
                    break;
            }

            const response: ApiResponse = {
                success: true,
                message: `${user.role} dashboard retrieved successfully`,
                data,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export const dashboardController = new DashboardController();
