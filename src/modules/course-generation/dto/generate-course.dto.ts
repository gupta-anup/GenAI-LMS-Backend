import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseDifficulty } from '../../../database/entities';

export class GenerateCourseDto {
  @ApiProperty({
    description: 'The prompt describing what course to generate',
    example: 'pointers in C++',
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description: 'Desired difficulty level',
    enum: CourseDifficulty,
    example: CourseDifficulty.INTERMEDIATE,
  })
  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @ApiPropertyOptional({
    description: 'Desired number of lessons',
    minimum: 1,
    maximum: 20,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  lessonCount?: number;

  @ApiPropertyOptional({
    description: 'Include quizzes for each lesson',
    example: true,
  })
  @IsOptional()
  includeQuizzes?: boolean;

  @ApiPropertyOptional({
    description: 'Include video resources',
    example: true,
  })
  @IsOptional()
  includeVideos?: boolean;

  @ApiPropertyOptional({
    description: 'Target audience or prerequisites',
    example: ['basic programming knowledge', 'familiarity with C syntax'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetAudience?: string[];

  @ApiPropertyOptional({
    description: 'Specific topics to cover',
    example: ['pointer arithmetic', 'memory allocation', 'pointer to functions'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificTopics?: string[];
}
