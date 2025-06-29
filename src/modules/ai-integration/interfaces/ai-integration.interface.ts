import { CourseStructure, QuizStructure } from '../../course-generation/interfaces';

export interface AIProvider {
  generateCourseStructure(prompt: string, options?: CourseGenerationOptions): Promise<CourseStructure>;
  generateLessonContent(topic: string, context?: string): Promise<string>;
  generateQuiz(lessonContent: string, difficulty: string): Promise<QuizStructure>;
  improveContent(content: string, feedback: string): Promise<string>;
}

export interface CourseGenerationOptions {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  lessonCount?: number;
  targetAudience?: string[];
  specificTopics?: string[];
  includeQuizzes?: boolean;
  includeVideos?: boolean;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  requestId?: string;
}

export interface ContentGenerationRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface QuizGenerationRequest {
  lessonContent: string;
  difficulty: string;
  questionCount?: number;
  questionTypes?: string[];
  context?: string;
}
