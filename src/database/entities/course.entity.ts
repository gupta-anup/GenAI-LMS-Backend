import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';
import { CourseDifficulty, CourseStatus } from '../../common/enums';

@Entity('courses')
export class Course extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CourseDifficulty,
    default: CourseDifficulty.BEGINNER,
  })
  difficulty: CourseDifficulty;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.GENERATING,
  })
  status: CourseStatus;

  @Column({ type: 'int', nullable: true })
  estimatedDuration: number; // in minutes

  @Column({ type: 'text', nullable: true })
  prompt: string;

  @Column({ type: 'int', nullable: true })
  preferredDuration: number; // in minutes

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
  lessons: Lesson[];
}
