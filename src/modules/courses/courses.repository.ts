import { Injectable } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { Course } from '../../database/entities';
import { CourseStatus } from '../../common/enums';
import { GetCoursesDto } from './dto';

@Injectable()
export class CourseRepository extends Repository<Course> {
  constructor(private dataSource: DataSource) {
    super(Course, dataSource.createEntityManager());
  }

  async findCoursesByUserId(
    userId: string,
    filters: GetCoursesDto,
  ): Promise<[Course[], number]> {
    const { page = 1, limit = 10, status, search } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder: SelectQueryBuilder<Course> = this.createQueryBuilder('course')
      .where('course.userId = :userId', { userId })
      .leftJoinAndSelect('course.lessons', 'lessons')
      .orderBy('course.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(course.title ILIKE :search OR course.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.skip(skip).take(limit).getManyAndCount();
  }

  async findCourseByIdAndUserId(courseId: string, userId: string): Promise<Course | null> {
    return this.findOne({
      where: { id: courseId, userId },
      relations: [
        'lessons',
        'lessons.videos',
        'lessons.quiz',
        'lessons.quiz.questions',
      ],
      order: {
        lessons: {
          order: 'ASC',
        },
      },
    });
  }

  async findCoursesWithLessonCount(userId: string): Promise<Course[]> {
    return this.createQueryBuilder('course')
      .leftJoin('course.lessons', 'lessons')
      .addSelect('COUNT(lessons.id)', 'lessonsCount')
      .where('course.userId = :userId', { userId })
      .groupBy('course.id')
      .getRawAndEntities()
      .then(result => result.entities);
  }

  async updateCourseStatus(courseId: string, status: CourseStatus): Promise<void> {
    await this.update(courseId, { status });
  }
}
