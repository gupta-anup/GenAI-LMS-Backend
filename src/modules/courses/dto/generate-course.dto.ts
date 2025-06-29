import { IsString, IsEnum, IsOptional, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseDifficulty } from '../../../common/enums';

export class GenerateCourseDto {
  @ApiProperty({
    description: 'User prompt for course generation',
    example: 'I want to learn Pointers in C++',
  })
  @IsString()
  @MinLength(10)
  prompt: string;

  @ApiProperty({
    description: 'Course difficulty level',
    enum: CourseDifficulty,
    example: CourseDifficulty.BEGINNER,
  })
  @IsEnum(CourseDifficulty)
  difficulty: CourseDifficulty;

  @ApiProperty({
    description: 'Preferred duration in minutes',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  preferredDuration?: number;
}
