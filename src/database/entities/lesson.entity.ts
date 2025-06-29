import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Quiz } from './quiz.entity';
import { Resource } from './resource.entity';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  QUIZ = 'quiz',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: LessonType,
    default: LessonType.TEXT,
  })
  type: LessonType;

  @Column({ type: 'int' })
  orderIndex: number;

  @Column({ type: 'int', default: 0 })
  estimatedDurationMinutes: number;

  @Column('simple-array', { nullable: true })
  learningObjectives: string[];

  @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: string;

  @OneToMany(() => Quiz, (quiz) => quiz.lesson, { cascade: true })
  quizzes: Quiz[];

  @OneToMany(() => Resource, (resource) => resource.lesson, { cascade: true })
  resources: Resource[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
