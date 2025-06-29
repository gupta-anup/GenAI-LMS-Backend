#!/usr/bin/env node

/**
 * AI Course Builder Demo Script
 * 
 * This script demonstrates how to use the AI Course Builder API
 * to generate courses from prompts.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Sample course generation requests
const coursePrompts = [
  {
    prompt: "pointers in C++",
    difficulty: "intermediate",
    lessonCount: 4,
    includeQuizzes: true,
    includeVideos: true,
    targetAudience: ["basic C++ knowledge"],
    specificTopics: ["pointer arithmetic", "memory allocation", "smart pointers", "pointer to functions"]
  },
  {
    prompt: "React Hooks for beginners",
    difficulty: "beginner", 
    lessonCount: 5,
    includeQuizzes: true,
    includeVideos: true,
    targetAudience: ["basic JavaScript knowledge", "familiarity with React components"],
    specificTopics: ["useState", "useEffect", "custom hooks", "useContext", "performance optimization"]
  },
  {
    prompt: "Machine Learning fundamentals",
    difficulty: "beginner",
    lessonCount: 6,
    includeQuizzes: true,
    includeVideos: true,
    targetAudience: ["basic programming knowledge", "high school mathematics"],
    specificTopics: ["supervised learning", "unsupervised learning", "neural networks", "model evaluation"]
  }
];

// Mock JWT token for demonstration (in real usage, you'd get this from authentication)
const DEMO_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_token_for_testing';

async function demonstrateCourseGeneration() {
  console.log('🚀 AI Course Builder Demo\n');
  console.log('This demo shows how to generate courses from simple prompts.\n');

  for (const [index, courseData] of coursePrompts.entries()) {
    console.log(`\n📚 Example ${index + 1}: ${courseData.prompt}`);
    console.log('=' .repeat(50));
    
    try {
      // Step 1: Generate the course
      console.log('🤖 Sending course generation request...');
      
      const response = await axios.post(`${BASE_URL}/course-generation`, courseData, {
        headers: {
          'Authorization': `Bearer ${DEMO_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Course generation started!`);
      console.log(`📝 Course ID: ${response.data.courseId}`);
      
      // Step 2: Simulate progress monitoring
      console.log('\n📊 Course Generation Progress:');
      const progressStages = [
        { stage: 'analyzing', progress: 10, message: 'Analyzing your prompt and generating course structure...' },
        { stage: 'generating_structure', progress: 25, message: 'Course structure generated successfully!' },
        { stage: 'creating_content', progress: 40, message: 'Creating course content and lessons...' },
        { stage: 'finding_resources', progress: 70, message: 'Finding relevant YouTube videos and resources...' },
        { stage: 'generating_quizzes', progress: 85, message: 'Generating quizzes and assessments...' },
        { stage: 'finalizing', progress: 100, message: 'Course generation completed successfully!' }
      ];

      for (const stage of progressStages) {
        console.log(`[${stage.progress.toString().padStart(3)}%] ${stage.message}`);
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Step 3: Retrieve the generated course
      console.log('\n📖 Retrieving generated course...');
      const courseResponse = await axios.get(`${BASE_URL}/course-generation/${response.data.courseId}`, {
        headers: {
          'Authorization': `Bearer ${DEMO_TOKEN}`
        }
      });

      const course = courseResponse.data;
      console.log(`\n🎯 Generated Course: "${course.title}"`);
      console.log(`📝 Description: ${course.description.substring(0, 100)}...`);
      console.log(`⏱️  Estimated Duration: ${course.estimatedDurationMinutes} minutes`);
      console.log(`🎖️  Difficulty: ${course.difficulty}`);
      console.log(`📚 Number of Lessons: ${course.lessons?.length || 0}`);
      console.log(`🎥 Video Resources: ${course.lessons?.reduce((total, lesson) => total + (lesson.resources?.length || 0), 0) || 0}`);
      console.log(`❓ Quizzes: ${course.lessons?.reduce((total, lesson) => total + (lesson.quizzes?.length || 0), 0) || 0}`);

      if (course.lessons && course.lessons.length > 0) {
        console.log('\n📋 Course Outline:');
        course.lessons.forEach((lesson, i) => {
          console.log(`  ${i + 1}. ${lesson.title} (${lesson.estimatedDurationMinutes} min)`);
          if (lesson.resources && lesson.resources.length > 0) {
            console.log(`     📺 ${lesson.resources.length} video(s)`);
          }
          if (lesson.quizzes && lesson.quizzes.length > 0) {
            console.log(`     ❓ ${lesson.quizzes.length} quiz(es)`);
          }
        });
      }

    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Authentication required. Please set up proper JWT token.');
        console.log('💡 This is expected in demo mode - the API requires authentication.');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Cannot connect to the API server.');
        console.log('💡 Make sure the server is running on http://localhost:3000');
        console.log('💡 Run: npm run start:dev');
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    if (index < coursePrompts.length - 1) {
      console.log('\n' + '⏳ Waiting before next example...'.padStart(25));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Demo completed!');
  console.log('\n💡 Key Features Demonstrated:');
  console.log('  ✅ Prompt-to-course generation');
  console.log('  ✅ AI-powered content creation');
  console.log('  ✅ YouTube video integration');
  console.log('  ✅ Automated quiz generation');
  console.log('  ✅ Progress tracking');
  console.log('  ✅ Structured course output');
  
  console.log('\n🚀 Next Steps:');
  console.log('  1. Set up authentication (JWT)');
  console.log('  2. Configure AI API keys (OpenAI/Anthropic)');
  console.log('  3. Add YouTube API key for real video integration');
  console.log('  4. Create a frontend to visualize the courses');
  console.log('  5. Add user enrollment and progress tracking');
  
  console.log('\n📖 For more details, see: AI_COURSE_BUILDER_README.md');
}

// Run the demo
if (require.main === module) {
  demonstrateCourseGeneration().catch(console.error);
}

module.exports = { demonstrateCourseGeneration };
