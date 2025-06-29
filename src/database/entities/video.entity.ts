import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Lesson } from './lesson.entity';

@Entity('videos')
export class Video extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  youtubeId: string;

  @Column({ type: 'int' })
  duration: number; // in seconds

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'uuid' })
  lessonId: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.videos)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;
}
