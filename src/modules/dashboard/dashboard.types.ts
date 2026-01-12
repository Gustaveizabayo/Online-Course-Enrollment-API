export interface StudentDashboardData {
    totalEnrollments: number;
    completedCourses: number;
    inProgressCourses: number;
    recentActivity: any[]; // Can be typed more specifically based on ActivityLog
    upcomingLessons: any[];
}

export interface InstructorDashboardData {
    totalStudents: number;
    totalCourses: number;
    publishedCourses: number;
    totalEarnings: number;
    recentEnrollments: any[];
    coursePerformance: {
        courseId: string;
        title: string;
        students: number;
        rating: number;
    }[];
}

export interface AdminDashboardData {
    totalUsers: number;
    totalInstructors: number;
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    recentApplications: any[];
    systemHealth: {
        status: string;
        uptime: number; // in seconds
    };
}

export type DashboardData = StudentDashboardData | InstructorDashboardData | AdminDashboardData;
