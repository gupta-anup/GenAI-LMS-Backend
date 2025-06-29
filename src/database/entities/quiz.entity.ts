import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Lesson } from './lesson.entity';
import { Question } from './question.entity';

@Entity('quizzes')
export class Quiz extends BaseEntity {
  @Column({ type: 'uuid' })
  lessonId: string;

  @OneToOne(() => Lesson, (lesson) => lesson.quiz)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions: Question[];
}
