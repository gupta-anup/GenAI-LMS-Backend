import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Quiz } from './quiz.entity';
import { QuestionType } from '../../common/enums';

@Entity('questions')
export class Question extends BaseEntity {
  @Column({ type: 'text' })
  question: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @Column({ type: 'json', nullable: true })
  options: string[];

  @Column({ type: 'int', nullable: true })
  correctAnswer: number;

  @Column({ type: 'uuid' })
  quizId: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;
}
