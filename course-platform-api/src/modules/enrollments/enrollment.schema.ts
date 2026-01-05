import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  courseId: z.string().uuid(),
});