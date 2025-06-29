import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  Course, 
  Lesson, 
  Quiz, 
  QuizQuestion, 
  Resource,
  CourseStatus,
  CourseDifficulty,
  LessonType,
  ResourceType,
  QuizType,
  QuestionType,
} from '../../database/entities';
import { AIIntegrationService } from '../ai-integration';
import { YouTubeIntegrationService } from '../youtube-integration';
import { GenerateCourseDto } from './dto';
import { CourseStructure, GenerationProgress } from './interfaces';

@Injectable()
export class CourseGenerationService {
  private readonly logger = new Logger(CourseGenerationService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    private aiService: AIIntegrationService,
    private youtubeService: YouTubeIntegrationService,
  ) {}

  async generateCourse(
    generateCourseDto: GenerateCourseDto,
    createdById: string,
    progressCallback?: (progress: GenerationProgress) => void,
  ): Promise<Course> {
    this.logger.log(`Starting course generation for prompt: ${generateCourseDto.prompt}`);

    try {
      // Step 1: Generate course structure using AI
      progressCallback?.({
        stage: 'analyzing',
        progress: 10,
        message: 'Analyzing your prompt and generating course structure...',
      });

      const courseStructure = await this.aiService.generateCourseStructure(
        generateCourseDto.prompt,
        {
          difficulty: generateCourseDto.difficulty,
          lessonCount: generateCourseDto.lessonCount,
          targetAudience: generateCourseDto.targetAudience,
          specificTopics: generateCourseDto.specificTopics,
          includeQuizzes: generateCourseDto.includeQuizzes,
          includeVideos: generateCourseDto.includeVideos,
        }
      );

      progressCallback?.({
        stage: 'generating_structure',
        progress: 25,
        message: 'Course structure generated successfully!',
      });

      // Step 2: Create course entity
      const course = await this.createCourseEntity(courseStructure, generateCourseDto, createdById);

      progressCallback?.({
        stage: 'creating_content',
        progress: 40,
        message: 'Creating course content and lessons...',
      });

      // Step 3: Generate detailed content for each lesson
      const lessons = await this.createLessonsWithContent(courseStructure, course.id, progressCallback);

      progressCallback?.({
        stage: 'finding_resources',
        progress: 70,
        message: 'Finding relevant YouTube videos and resources...',
      });

      // Step 4: Find and add relevant resources (YouTube videos)
      if (generateCourseDto.includeVideos !== false) {
        await this.addVideoResources(lessons, courseStructure);
      }

      progressCallback?.({
        stage: 'generating_quizzes',
        progress: 85,
        message: 'Generating quizzes and assessments...',
      });

      // Step 5: Generate quizzes if requested
      if (generateCourseDto.includeQuizzes !== false) {
        await this.generateQuizzes(lessons, courseStructure);
      }

      progressCallback?.({
        stage: 'finalizing',
        progress: 100,
        message: 'Course generation completed successfully!',
      });

      // Return the complete course with all relations
      const finalCourse = await this.courseRepository.findOne({
        where: { id: course.id },
        relations: [
          'lessons',
          'lessons.resources',
          'lessons.quizzes',
          'lessons.quizzes.questions',
        ],
      });

      if (!finalCourse) {
        throw new Error('Failed to retrieve generated course');
      }

      return finalCourse;

    } catch (error) {
      this.logger.error('Error generating course:', error);
      throw new Error(`Failed to generate course: ${error.message}`);
    }
  }

  async getCourse(courseId: string): Promise<Course | null> {
    return await this.courseRepository.findOne({
      where: { id: courseId },
      relations: [
        'lessons',
        'lessons.resources', 
        'lessons.quizzes',
        'lessons.quizzes.questions',
        'creator',
        'enrollments',
      ],
    });
  }

  async getUserCourses(userId: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { createdBy: userId },
      relations: ['lessons', 'enrollments'],
      order: { createdAt: 'DESC' },
    });
  }

  async publishCourse(courseId: string, userId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, createdBy: userId },
    });

    if (!course) {
      throw new Error('Course not found or access denied');
    }

    course.status = CourseStatus.PUBLISHED;
    return await this.courseRepository.save(course);
  }

  private async createCourseEntity(
    structure: CourseStructure,
    dto: GenerateCourseDto,
    createdById: string,
  ): Promise<Course> {
    const course = this.courseRepository.create({
      title: structure.title,
      description: structure.description,
      prompt: dto.prompt,
      difficulty: this.mapDifficulty(structure.difficulty),
      estimatedDurationMinutes: structure.estimatedDurationMinutes,
      tags: structure.tags,
      learningObjectives: structure.learningObjectives,
      status: CourseStatus.DRAFT,
      createdBy: createdById,
    });

    return await this.courseRepository.save(course);
  }

  private async createLessonsWithContent(
    structure: CourseStructure,
    courseId: string,
    progressCallback?: (progress: GenerationProgress) => void,
  ): Promise<Lesson[]> {
    const lessons: Lesson[] = [];

    for (let i = 0; i < structure.lessons.length; i++) {
      const lessonStructure = structure.lessons[i];
      
      progressCallback?.({
        stage: 'creating_content',
        progress: 40 + (i / structure.lessons.length) * 25,
        message: `Creating lesson ${i + 1}: ${lessonStructure.title}`,
        currentLesson: lessonStructure.title,
      });

      // Generate detailed content for the lesson using AI
      const detailedContent = await this.aiService.generateLessonContent(
        lessonStructure.title,
        `Course: ${structure.title}\nLesson objectives: ${lessonStructure.learningObjectives.join(', ')}\nExisting content: ${lessonStructure.content}`,
      );

      const lesson = this.lessonRepository.create({
        title: lessonStructure.title,
        content: detailedContent || lessonStructure.content,
        type: this.mapLessonType(lessonStructure.type),
        orderIndex: lessonStructure.orderIndex,
        estimatedDurationMinutes: lessonStructure.estimatedDurationMinutes,
        learningObjectives: lessonStructure.learningObjectives,
        courseId,
      });

      const savedLesson = await this.lessonRepository.save(lesson);
      lessons.push(savedLesson);
    }

    return lessons;
  }

  private async addVideoResources(lessons: Lesson[], structure: CourseStructure): Promise<void> {
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const lessonStructure = structure.lessons[i];

      try {
        // Search for relevant videos
        const searchQuery = `${lessonStructure.title} tutorial programming`;
        const searchResult = await this.youtubeService.searchVideos(searchQuery, {
          maxResults: 3,
          educationalChannelsOnly: true,
          duration: 'medium', // 4-20 minutes
          order: 'relevance',
        });

        // Create resource entities for top videos
        for (const video of searchResult.videos.slice(0, 2)) {
          if (video.relevanceScore > 0.7) { // Only high-relevance videos
            const resource = this.resourceRepository.create({
              title: video.title,
              description: video.description.substring(0, 500), // Limit description length
              type: ResourceType.VIDEO,
              url: video.url,
              thumbnailUrl: video.thumbnailUrl,
              duration: video.duration,
              relevanceScore: video.relevanceScore,
              isFromEducationalChannel: video.isEducational,
              tags: video.tags,
              author: video.channelName,
              orderIndex: 0,
              lessonId: lesson.id,
            });

            await this.resourceRepository.save(resource);
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to add video resources for lesson ${lesson.title}:`, error);
        // Continue with other lessons even if one fails
      }
    }
  }

  private async generateQuizzes(lessons: Lesson[], structure: CourseStructure): Promise<void> {
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const lessonStructure = structure.lessons[i];

      try {
        // Generate quiz using AI
        const quizStructure = await this.aiService.generateQuiz(
          lesson.content,
          structure.difficulty,
        );

        // Create quiz entity
        const quiz = this.quizRepository.create({
          title: quizStructure.title,
          description: quizStructure.description,
          type: this.mapQuizType(quizStructure.type),
          timeLimit: quizStructure.timeLimit || 0,
          maxAttempts: quizStructure.maxAttempts,
          passingScore: quizStructure.passingScore,
          lessonId: lesson.id,
        });

        const savedQuiz = await this.quizRepository.save(quiz);

        // Create quiz questions
        for (const questionStructure of quizStructure.questions) {
          const question = this.quizQuestionRepository.create({
            question: questionStructure.question,
            type: this.mapQuestionType(questionStructure.type),
            options: questionStructure.options || [],
            correctAnswers: questionStructure.correctAnswers,
            explanation: questionStructure.explanation,
            points: questionStructure.points,
            orderIndex: questionStructure.orderIndex,
            isRequired: true,
            quizId: savedQuiz.id,
          });

          await this.quizQuestionRepository.save(question);
        }
      } catch (error) {
        this.logger.warn(`Failed to generate quiz for lesson ${lesson.title}:`, error);
        // Continue with other lessons even if one fails
      }
    }
  }

  // Mapping functions
  private mapDifficulty(difficulty: string): CourseDifficulty {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return CourseDifficulty.BEGINNER;
      case 'intermediate':
        return CourseDifficulty.INTERMEDIATE;
      case 'advanced':
        return CourseDifficulty.ADVANCED;
      default:
        return CourseDifficulty.INTERMEDIATE;
    }
  }

  private mapLessonType(type: string): LessonType {
    switch (type.toLowerCase()) {
      case 'video':
        return LessonType.VIDEO;
      case 'text':
        return LessonType.TEXT;
      case 'interactive':
        return LessonType.INTERACTIVE;
      case 'quiz':
        return LessonType.QUIZ;
      default:
        return LessonType.TEXT;
    }
  }

  private mapQuizType(type: string): QuizType {
    switch (type.toLowerCase()) {
      case 'knowledge_check':
        return QuizType.KNOWLEDGE_CHECK;
      case 'assessment':
        return QuizType.ASSESSMENT;
      case 'practice':
        return QuizType.PRACTICE;
      default:
        return QuizType.KNOWLEDGE_CHECK;
    }
  }

  private mapQuestionType(type: string): QuestionType {
    switch (type.toLowerCase()) {
      case 'multiple_choice':
        return QuestionType.MULTIPLE_CHOICE;
      case 'true_false':
        return QuestionType.TRUE_FALSE;
      case 'short_answer':
        return QuestionType.SHORT_ANSWER;
      case 'essay':
        return QuestionType.ESSAY;
      case 'fill_in_the_blank':
        return QuestionType.FILL_IN_THE_BLANK;
      default:
        return QuestionType.MULTIPLE_CHOICE;
    }
  }
}
