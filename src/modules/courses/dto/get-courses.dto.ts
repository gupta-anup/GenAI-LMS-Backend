import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto';
import { CourseStatus } from '../../../common/enums';

export class GetCoursesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by course status',
    enum: CourseStatus,
    example: CourseStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional({
    description: 'Search courses by title or description',
    example: 'JavaScript',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
