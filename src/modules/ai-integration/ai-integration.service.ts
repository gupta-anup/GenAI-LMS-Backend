import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import {
  AIProvider,
  CourseGenerationOptions,
  AIResponse,
  ContentGenerationRequest,
  QuizGenerationRequest,
} from './interfaces';
import { CourseStructure, QuizStructure } from '../course-generation/interfaces';

@Injectable()
export class AIIntegrationService implements AIProvider {
  private readonly logger = new Logger(AIIntegrationService.name);
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor(private configService: ConfigService) {
    this.initializeProviders();
  }

  private initializeProviders() {
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.logger.log('OpenAI initialized');
    }

    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
      this.logger.log('Anthropic initialized');
    }

    if (!openaiKey && !anthropicKey) {
      this.logger.warn('No AI API keys found. Using mock responses.');
    }
  }

  async generateCourseStructure(
    prompt: string,
    options?: CourseGenerationOptions,
  ): Promise<CourseStructure> {
    this.logger.log(`Generating course structure for: ${prompt}`);

    try {
      if (this.openai) {
        return await this.generateCourseWithOpenAI(prompt, options);
      } else if (this.anthropic) {
        return await this.generateCourseWithAnthropic(prompt, options);
      } else {
        return this.generateMockCourse(prompt, options);
      }
    } catch (error) {
      this.logger.error('Error generating course structure:', error);
      // Fallback to mock data if AI fails
      return this.generateMockCourse(prompt, options);
    }
  }

  async generateLessonContent(topic: string, context?: string): Promise<string> {
    this.logger.log(`Generating lesson content for: ${topic}`);

    try {
      if (this.openai) {
        return await this.generateContentWithOpenAI(topic, context);
      } else if (this.anthropic) {
        return await this.generateContentWithAnthropic(topic, context);
      } else {
        return this.generateMockLessonContent(topic);
      }
    } catch (error) {
      this.logger.error('Error generating lesson content:', error);
      return this.generateMockLessonContent(topic);
    }
  }

  async generateQuiz(lessonContent: string, difficulty: string): Promise<QuizStructure> {
    this.logger.log(`Generating quiz for difficulty: ${difficulty}`);

    try {
      if (this.openai) {
        return await this.generateQuizWithOpenAI(lessonContent, difficulty);
      } else if (this.anthropic) {
        return await this.generateQuizWithAnthropic(lessonContent, difficulty);
      } else {
        return this.generateMockQuiz(difficulty);
      }
    } catch (error) {
      this.logger.error('Error generating quiz:', error);
      return this.generateMockQuiz(difficulty);
    }
  }

  async improveContent(content: string, feedback: string): Promise<string> {
    this.logger.log('Improving content based on feedback');

    try {
      if (this.openai) {
        return await this.improveContentWithOpenAI(content, feedback);
      } else if (this.anthropic) {
        return await this.improveContentWithAnthropic(content, feedback);
      } else {
        return content; // Return original if no AI available
      }
    } catch (error) {
      this.logger.error('Error improving content:', error);
      return content;
    }
  }

  private async generateCourseWithOpenAI(
    prompt: string,
    options?: CourseGenerationOptions,
  ): Promise<CourseStructure> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }
    
    const systemPrompt = this.buildCourseGenerationPrompt(options);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    return JSON.parse(content);
  }

  private async generateCourseWithAnthropic(
    prompt: string,
    options?: CourseGenerationOptions,
  ): Promise<CourseStructure> {
    if (!this.anthropic) {
      throw new Error('Anthropic not initialized');
    }
    
    const systemPrompt = this.buildCourseGenerationPrompt(options);
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 3000,
      messages: [
        { role: 'user', content: `${systemPrompt}\n\n${prompt}` }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return JSON.parse(content.text);
  }

  private async generateContentWithOpenAI(topic: string, context?: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }
    
    const systemPrompt = `You are an expert educational content creator. Generate comprehensive, engaging lesson content that is clear, well-structured, and educational. Include examples, explanations, and practical applications.`;
    
    const userPrompt = `Generate lesson content for: ${topic}${context ? `\nContext: ${context}` : ''}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async generateContentWithAnthropic(topic: string, context?: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Anthropic not initialized');
    }
    
    const systemPrompt = `You are an expert educational content creator. Generate comprehensive, engaging lesson content that is clear, well-structured, and educational. Include examples, explanations, and practical applications.`;
    
    const userPrompt = `Generate lesson content for: ${topic}${context ? `\nContext: ${context}` : ''}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return content.text;
  }

  private async generateQuizWithOpenAI(lessonContent: string, difficulty: string): Promise<QuizStructure> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    const systemPrompt = `You are an expert quiz creator. Generate educational quizzes in JSON format based on lesson content. Create questions that test understanding and application of concepts.`;
    
    const userPrompt = `Generate a quiz for this lesson content (difficulty: ${difficulty}):\n${lessonContent}\n\nReturn only valid JSON matching the QuizStructure interface.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No quiz content generated from OpenAI');
    }

    return JSON.parse(content);
  }

  private async generateQuizWithAnthropic(lessonContent: string, difficulty: string): Promise<QuizStructure> {
    if (!this.anthropic) {
      throw new Error('Anthropic not initialized');
    }

    const systemPrompt = `You are an expert quiz creator. Generate educational quizzes in JSON format based on lesson content. Create questions that test understanding and application of concepts.`;
    
    const userPrompt = `Generate a quiz for this lesson content (difficulty: ${difficulty}):\n${lessonContent}\n\nReturn only valid JSON matching the QuizStructure interface.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      messages: [
        { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return JSON.parse(content.text);
  }

  private async improveContentWithOpenAI(content: string, feedback: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert content editor. Improve the given content based on the feedback provided.' },
        { role: 'user', content: `Content: ${content}\n\nFeedback: ${feedback}\n\nImprove the content:` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || content;
  }

  private async improveContentWithAnthropic(content: string, feedback: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Anthropic not initialized');
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: `You are an expert content editor. Improve the given content based on the feedback provided.\n\nContent: ${content}\n\nFeedback: ${feedback}\n\nImprove the content:` }
      ],
    });

    const content_response = response.content[0];
    if (content_response.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return content_response.text;
  }

  private buildCourseGenerationPrompt(options?: CourseGenerationOptions): string {
    const lessonCount = options?.lessonCount || 4;
    const difficulty = options?.difficulty || 'intermediate';
    const includeQuizzes = options?.includeQuizzes !== false;
    
    return `You are an expert course designer. Generate a comprehensive course structure in JSON format that matches the CourseStructure interface.

Requirements:
- Create exactly ${lessonCount} lessons
- Difficulty level: ${difficulty}
- ${includeQuizzes ? 'Include quizzes for each lesson' : 'Do not include quizzes'}
- Each lesson should have clear learning objectives
- Content should be practical and engaging
- Include estimated duration for each lesson
- Generate appropriate tags for the course

${options?.targetAudience ? `Target audience: ${options.targetAudience.join(', ')}` : ''}
${options?.specificTopics ? `Specific topics to cover: ${options.specificTopics.join(', ')}` : ''}

Return only valid JSON matching the CourseStructure interface.`;
  }

  // Mock implementations for when no AI service is available
  private generateMockCourse(prompt: string, options?: CourseGenerationOptions): CourseStructure {
    const lessonCount = options?.lessonCount || 4;
    const difficulty = options?.difficulty || 'intermediate';
    
    return {
      title: `Learn ${prompt}`,
      description: `A comprehensive course covering ${prompt} concepts and practical applications.`,
      difficulty,
      estimatedDurationMinutes: lessonCount * 45,
      learningObjectives: [
        `Understanding core concepts of ${prompt}`,
        `Practical application of ${prompt}`,
        `Best practices and common pitfalls`,
        'Real-world examples and use cases'
      ],
      tags: [prompt.toLowerCase().replace(/\s+/g, '-'), 'programming', 'tutorial'],
      lessons: Array.from({ length: lessonCount }, (_, i) => ({
        title: `Lesson ${i + 1}: ${prompt} Fundamentals ${i + 1}`,
        content: `This lesson covers the fundamental concepts of ${prompt}. We'll explore key principles and provide practical examples.`,
        type: 'text' as const,
        orderIndex: i,
        estimatedDurationMinutes: 45,
        learningObjectives: [
          `Understanding ${prompt} concept ${i + 1}`,
          `Practical application examples`,
        ],
      })),
    };
  }

  private generateMockLessonContent(topic: string): string {
    return `# ${topic}

## Introduction
This lesson covers the key concepts of ${topic}. We'll explore the fundamental principles and provide practical examples.

## Key Concepts
- Concept 1: Basic understanding
- Concept 2: Practical application
- Concept 3: Advanced techniques

## Examples
Here are some practical examples demonstrating ${topic}:

1. Example 1: Basic implementation
2. Example 2: Real-world application
3. Example 3: Advanced usage

## Summary
In this lesson, we covered the essential aspects of ${topic} and how to apply them in practice.`;
  }

  private generateMockQuiz(difficulty: string): QuizStructure {
    return {
      title: `${difficulty} Level Quiz`,
      description: `Test your understanding of the lesson concepts`,
      type: 'knowledge_check',
      maxAttempts: 3,
      passingScore: 70,
      questions: [
        {
          question: 'What is the main concept covered in this lesson?',
          type: 'multiple_choice',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswers: ['Option A'],
          explanation: 'This is the correct answer because...',
          points: 1,
          orderIndex: 0,
        },
        {
          question: 'True or False: This concept is important for understanding the topic.',
          type: 'true_false',
          correctAnswers: ['true'],
          explanation: 'This statement is true because...',
          points: 1,
          orderIndex: 1,
        },
      ],
    };
  }
}
