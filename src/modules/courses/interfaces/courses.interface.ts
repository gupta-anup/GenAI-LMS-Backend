import { CourseDifficulty, CourseStatus } from '../../../common/enums';
import { Course } from '../../../database/entities';
import { User } from '../../../database/entities/user.entity';
import { Request } from 'express';

export interface CourseGenerationResponse {
  courseId: string;
  title: string;
  description: string;
  difficulty: CourseDifficulty;
  estimatedDuration: number;
  status: CourseStatus;
  lessons: any[];
  createdAt: Date;
}

export interface CourseListItem {
  id: string;
  title: string;
  description: string;
  difficulty: CourseDifficulty;
  status: CourseStatus;
  lessonsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedCoursesResponse {
  courses: CourseListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthenticatedRequest extends Request {
  user: User;
}
