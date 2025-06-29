import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CourseRepository } from './courses.repository';
import { GenerateCourseDto, GetCoursesDto } from './dto';
import { CourseGenerationResponse, CourseListItem, PaginatedCoursesResponse } from './interfaces';
import { Course, Lesson, Video, Quiz, Question } from '../../database/entities';
import { CourseStatus, CourseDifficulty, QuestionType } from '../../common/enums';
import { BaseResponseDto } from '../../common/dto';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  async generateCourse(
    userId: string,
    generateCourseDto: GenerateCourseDto,
  ): Promise<BaseResponseDto<CourseGenerationResponse>> {
    const { prompt, difficulty, preferredDuration } = generateCourseDto;

    // Create the course record
    const course = this.courseRepository.create({
      title: this.generateCourseTitle(prompt),
      description: this.generateCourseDescription(prompt),
      difficulty,
      status: CourseStatus.GENERATING,
      estimatedDuration: preferredDuration || this.estimateDuration(difficulty),
      prompt,
      preferredDuration,
      userId,
    });

    const savedCourse = await this.courseRepository.save(course);

    // Start course generation in background (simulate with timeout)
    this.startCourseGeneration(savedCourse.id);

    const response: CourseGenerationResponse = {
      courseId: savedCourse.id,
      title: savedCourse.title,
      description: savedCourse.description,
      difficulty: savedCourse.difficulty,
      estimatedDuration: savedCourse.estimatedDuration,
      status: savedCourse.status,
      lessons: [],
      createdAt: savedCourse.createdAt,
    };

    return new BaseResponseDto(
      true,
      'Course generation started successfully',
      response,
    );
  }

  async getCourses(
    userId: string,
    filters: GetCoursesDto,
  ): Promise<BaseResponseDto<PaginatedCoursesResponse>> {
    const [courses, total] = await this.courseRepository.findCoursesByUserId(
      userId,
      filters,
    );

    const { page = 1, limit = 10 } = filters;
    const totalPages = Math.ceil(total / limit);

    const coursesWithLessonsCount: CourseListItem[] = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      status: course.status,
      lessonsCount: course.lessons ? course.lessons.length : 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    const paginatedResponse: PaginatedCoursesResponse = {
      courses: coursesWithLessonsCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return new BaseResponseDto(
      true,
      'Courses retrieved successfully',
      paginatedResponse,
    );
  }

  async getCourseById(
    userId: string,
    courseId: string,
  ): Promise<BaseResponseDto<Course>> {
    const course = await this.courseRepository.findCourseByIdAndUserId(
      courseId,
      userId,
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return new BaseResponseDto(
      true,
      'Course retrieved successfully',
      course,
    );
  }

  async deleteCourse(
    userId: string,
    courseId: string,
  ): Promise<BaseResponseDto<{ message: string }>> {
    const course = await this.courseRepository.findCourseByIdAndUserId(
      courseId,
      userId,
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.courseRepository.softDelete(courseId);

    return new BaseResponseDto(
      true,
      'Course deleted successfully',
      { message: 'Course deleted successfully' },
    );
  }

  private generateCourseTitle(prompt: string): string {
    // Simple title generation logic - in real app, this would use AI
    const cleanPrompt = prompt.replace(/^I want to learn /i, '');
    return `Complete Guide to ${cleanPrompt}`;
  }

  private generateCourseDescription(prompt: string): string {
    // Simple description generation logic - in real app, this would use AI
    const topic = prompt.replace(/^I want to learn /i, '');
    return `Master ${topic} from basics to advanced concepts`;
  }

  private estimateDuration(difficulty: CourseDifficulty): number {
    switch (difficulty) {
      case CourseDifficulty.BEGINNER:
        return 120; // 2 hours
      case CourseDifficulty.INTERMEDIATE:
        return 240; // 4 hours
      case CourseDifficulty.ADVANCED:
        return 360; // 6 hours
      default:
        return 180; // 3 hours
    }
  }

  private async startCourseGeneration(courseId: string): Promise<void> {
    // Simulate course generation process
    // In a real application, this would call an AI service to generate course content
    setTimeout(async () => {
      try {
        await this.generateCourseContent(courseId);
        await this.courseRepository.updateCourseStatus(
          courseId,
          CourseStatus.COMPLETED,
        );
      } catch (error) {
        await this.courseRepository.updateCourseStatus(
          courseId,
          CourseStatus.FAILED,
        );
      }
    }, 5000); // Simulate 5 second generation time
  }

  private async generateCourseContent(courseId: string): Promise<void> {
    // This is a mock implementation
    // In real app, this would generate actual course content using AI
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Generate mock lessons
    const lessons = await this.generateMockLessons(courseId);
    
    // Update estimated duration based on generated content
    const totalDuration = lessons.reduce((acc, lesson) => {
      return acc + (lesson.videos?.reduce((videoAcc: number, video: any) => videoAcc + video.duration, 0) || 0);
    }, 0);

    await this.courseRepository.update(courseId, {
      estimatedDuration: Math.ceil(totalDuration / 60), // Convert to minutes
    });
  }

  private async generateMockLessons(courseId: string): Promise<any[]> {
    // Mock lesson generation
    const mockLessons = [
      {
        title: 'Introduction to Pointers',
        description: 'Understanding what pointers are and why they\'re useful',
        order: 1,
        videos: [
          {
            title: 'C++ Pointers Explained',
            youtubeId: 'dQw4w9WgXcQ',
            duration: 720, // 12 minutes
            thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          },
        ],
        quiz: {
          questions: [
            {
              question: 'What is a pointer in C++?',
              type: QuestionType.MULTIPLE_CHOICE,
              options: [
                'A variable that stores memory address',
                'A function that points to data',
                'A data type for text',
                'A loop construct',
              ],
              correctAnswer: 0,
            },
          ],
        },
      },
    ];

    // In a real implementation, you would save these to the database
    // For now, we'll just return the mock data
    return mockLessons;
  }
}
