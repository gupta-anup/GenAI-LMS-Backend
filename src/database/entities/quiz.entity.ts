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
import { Lesson } from './lesson.entity';
import { QuizQuestion } from './quiz-question.entity';

export enum QuizType {
  KNOWLEDGE_CHECK = 'knowledge_check',
  ASSESSMENT = 'assessment',
  PRACTICE = 'practice',
}

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: QuizType,
    default: QuizType.KNOWLEDGE_CHECK,
  })
  type: QuizType;

  @Column({ type: 'int', default: 0 })
  timeLimit: number; // in minutes, 0 means no time limit

  @Column({ type: 'int', default: 1 })
  maxAttempts: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  passingScore: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.quizzes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  lessonId: string;

  @OneToMany(() => QuizQuestion, (question) => question.quiz, { cascade: true })
  questions: QuizQuestion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
