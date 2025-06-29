import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Body, 
  Param, 
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';
import { CourseGenerationService } from './course-generation.service';
import { GenerateCourseDto } from './dto';
import { Course } from '../../database/entities';
import { GenerationProgress } from './interfaces';

@ApiTags('Course Generation')
@Controller('course-generation')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CourseGenerationController {
  private readonly logger = new Logger(CourseGenerationController.name);
  private readonly progressSubjects = new Map<string, Subject<MessageEvent>>();

  constructor(private readonly courseGenerationService: CourseGenerationService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new course from a prompt' })
  @ApiResponse({ status: 201, description: 'Course generation started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateCourse(
    @Body() generateCourseDto: GenerateCourseDto,
    @Request() req: any,
  ): Promise<{ courseId: string; message: string }> {
    this.logger.log(`Course generation request from user ${req.user.id}`);

    try {
      // Start course generation in background
      const coursePromise = this.courseGenerationService.generateCourse(
        generateCourseDto,
        req.user.id,
        (progress: GenerationProgress) => this.sendProgress(req.user.id, progress),
      );

      // Wait for course to be created (get the initial course entity)
      const course = await coursePromise;

      return {
        courseId: course.id,
        message: 'Course generated successfully',
      };
    } catch (error) {
      this.logger.error('Error generating course:', error);
      throw new HttpException(
        `Failed to generate course: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':courseId')
  @ApiOperation({ summary: 'Get a generated course by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourse(
    @Param('courseId') courseId: string,
    @Request() req: any,
  ): Promise<Course> {
    const course = await this.courseGenerationService.getCourse(courseId);

    if (!course) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has access to this course (creator or enrolled)
    const hasAccess = course.createdBy === req.user.id || 
                     course.enrollments?.some(e => e.userId === req.user.id);

    if (!hasAccess) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return course;
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses created by the user' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async getUserCourses(@Request() req: any): Promise<Course[]> {
    return await this.courseGenerationService.getUserCourses(req.user.id);
  }

  @Patch(':courseId/publish')
  @ApiOperation({ summary: 'Publish a course' })
  @ApiResponse({ status: 200, description: 'Course published successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async publishCourse(
    @Param('courseId') courseId: string,
    @Request() req: any,
  ): Promise<Course> {
    try {
      return await this.courseGenerationService.publishCourse(courseId, req.user.id);
    } catch (error) {
      if (error.message === 'Course not found or access denied') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to publish course: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Sse('progress/:userId')
  @ApiOperation({ summary: 'Subscribe to course generation progress updates' })
  courseGenerationProgress(@Param('userId') userId: string): Observable<MessageEvent> {
    this.logger.log(`SSE connection established for user ${userId}`);
    
    if (!this.progressSubjects.has(userId)) {
      this.progressSubjects.set(userId, new Subject<MessageEvent>());
    }

    const subject = this.progressSubjects.get(userId)!;
    
    // Clean up when connection closes
    return new Observable<MessageEvent>((observer) => {
      const subscription = subject.subscribe(observer);
      
      return () => {
        subscription.unsubscribe();
        if (this.progressSubjects.has(userId)) {
          this.progressSubjects.delete(userId);
        }
      };
    });
  }

  private sendProgress(userId: string, progress: GenerationProgress): void {
    const subject = this.progressSubjects.get(userId);
    if (subject) {
      subject.next({
        data: progress,
        type: 'progress',
      } as MessageEvent);
    }
  }
}
