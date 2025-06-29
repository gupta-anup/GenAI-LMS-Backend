import { Entity, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Course } from './course.entity';
import { Video } from './video.entity';
import { Quiz } from './quiz.entity';

@Entity('lessons')
export class Lesson extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, (course) => course.lessons)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => Video, (video) => video.lesson, { cascade: true })
  videos: Video[];

  @OneToOne(() => Quiz, (quiz) => quiz.lesson, { cascade: true })
  quiz: Quiz;
}
