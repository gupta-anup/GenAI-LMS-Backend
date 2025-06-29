import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { GenerateCourseDto, GetCoursesDto } from './dto';
import { AuthenticatedRequest } from './interfaces';
import { JwtAuthGuard } from '../auth/guards';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new course based on user prompt' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Course generation started successfully',
  })
  async generateCourse(
    @Body() generateCourseDto: GenerateCourseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.generateCourse(req.user.id, generateCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user courses with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['generating', 'completed', 'failed'],
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search courses by title or description',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Courses retrieved successfully',
  })
  async getCourses(
    @Query() filters: GetCoursesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.getCourses(req.user.id, filters);
  }

  @Get(':courseId')
  @ApiOperation({ summary: 'Get detailed course information with lessons' })
  @ApiParam({
    name: 'courseId',
    type: String,
    description: 'Course ID',
    example: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  async getCourseById(
    @Param('courseId') courseId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.getCourseById(req.user.id, courseId);
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({
    name: 'courseId',
    type: String,
    description: 'Course ID',
    example: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  async deleteCourse(
    @Param('courseId') courseId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.deleteCourse(req.user.id, courseId);
  }
}
