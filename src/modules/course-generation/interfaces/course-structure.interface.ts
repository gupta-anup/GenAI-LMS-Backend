export interface CourseStructure {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDurationMinutes: number;
  learningObjectives: string[];
  lessons: LessonStructure[];
  tags: string[];
}

export interface LessonStructure {
  title: string;
  content: string;
  type: 'video' | 'text' | 'interactive' | 'quiz';
  orderIndex: number;
  estimatedDurationMinutes: number;
  learningObjectives: string[];
  resources?: ResourceStructure[];
  quiz?: QuizStructure;
}

export interface ResourceStructure {
  title: string;
  description?: string;
  type: 'video' | 'article' | 'pdf' | 'link' | 'book' | 'tutorial';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  relevanceScore: number;
  author?: string;
  tags?: string[];
}

export interface QuizStructure {
  title: string;
  description?: string;
  type: 'knowledge_check' | 'assessment' | 'practice';
  timeLimit?: number;
  maxAttempts: number;
  passingScore: number;
  questions: QuestionStructure[];
}

export interface QuestionStructure {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_in_the_blank';
  options?: string[];
  correctAnswers: string[];
  explanation?: string;
  points: number;
  orderIndex: number;
}

export interface GenerationProgress {
  stage: 'analyzing' | 'generating_structure' | 'creating_content' | 'finding_resources' | 'generating_quizzes' | 'finalizing';
  progress: number; // 0-100
  message: string;
  currentLesson?: string;
}
