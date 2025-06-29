import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseRepository } from './courses.repository';
import { Course, Lesson, Video, Quiz, Question } from '../../database/entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Lesson, Video, Quiz, Question]),
    AuthModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CourseRepository],
  exports: [CoursesService, CourseRepository],
})
export class CoursesModule {}
