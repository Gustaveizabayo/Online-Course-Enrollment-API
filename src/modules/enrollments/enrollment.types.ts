export interface CreateEnrollmentDto {
  courseId: string;
  userId: string;
}

export interface EnrollmentResponse {
  id: string;
  courseId: string;
  userId: string;
  status: string;
  enrolledAt: Date;
  completedAt: Date | null;
}
