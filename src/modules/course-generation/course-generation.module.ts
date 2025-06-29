import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseGenerationService } from './course-generation.service';
import { CourseGenerationController } from './course-generation.controller';
import { 
  Course, 
  Lesson, 
  Quiz, 
  QuizQuestion, 
  Resource 
} from '../../database/entities';
import { AIIntegrationModule } from '../ai-integration';
import { YouTubeIntegrationModule } from '../youtube-integration';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Lesson, Quiz, QuizQuestion, Resource]),
    AIIntegrationModule,
    YouTubeIntegrationModule,
  ],
  controllers: [CourseGenerationController],
  providers: [CourseGenerationService],
  exports: [CourseGenerationService],
})
export class CourseGenerationModule {}
