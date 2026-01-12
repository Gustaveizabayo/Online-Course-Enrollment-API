export interface CreateCourseDto {
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  instructorId: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  isPublished?: boolean;
}

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  instructorId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateModuleDto {
  title: string;
  order: number;
}

export interface CreateLessonDto {
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT' | 'RESOURCE';
  content?: string;
  videoUrl?: string;
  order: number;
  duration: number;
}
