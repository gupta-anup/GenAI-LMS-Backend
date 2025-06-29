import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';

export enum ResourceType {
  VIDEO = 'video',
  ARTICLE = 'article',
  PDF = 'pdf',
  LINK = 'link',
  BOOK = 'book',
  TUTORIAL = 'tutorial',
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
    default: ResourceType.LINK,
  })
  type: ResourceType;

  @Column({ length: 500 })
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'int', nullable: true })
  duration: number; // in seconds for videos

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  relevanceScore: number; // AI-generated relevance score (0-1)

  @Column({ type: 'boolean', default: false })
  isFromEducationalChannel: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  author: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.resources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  lessonId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
