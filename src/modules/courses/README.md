# Courses Module

This module handles course management functionality for the GenAI LMS Backend.

## Features

- **Course Generation**: Generate courses based on user prompts using AI
- **Course Management**: CRUD operations for courses
- **Lesson Management**: Organize courses into structured lessons
- **Video Integration**: Embed YouTube videos in lessons
- **Quiz System**: Create quizzes with multiple choice questions
- **User Authentication**: Secure course access with JWT tokens
- **Pagination**: Efficient course listing with pagination
- **Search & Filtering**: Search courses by title/description and filter by status

## API Endpoints

### POST /courses/generate
Generate a new course based on user prompt.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "prompt": "I want to learn Pointers in C++",
  "difficulty": "beginner",
  "preferredDuration": 120
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Course generation started successfully",
  "data": {
    "courseId": "uuid",
    "title": "Complete Guide to Pointers in C++",
    "description": "Master C++ pointers from basics to advanced concepts",
    "difficulty": "beginner",
    "estimatedDuration": 180,
    "status": "generating",
    "lessons": [],
    "createdAt": "2025-06-29T10:00:00Z"
  },
  "timestamp": "2025-06-29T10:00:00Z"
}
```

### GET /courses
Get user's courses with pagination and filtering.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (generating, completed, failed)
- `search` (optional): Search by title or description

**Response (200):**
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "courses": [
      {
        "id": "uuid",
        "title": "Complete Guide to Pointers in C++",
        "description": "Master C++ pointers from basics to advanced concepts",
        "difficulty": "beginner",
        "status": "completed",
        "lessonsCount": 4,
        "createdAt": "2025-06-29T10:00:00Z",
        "updatedAt": "2025-06-29T10:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCourses": 25,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2025-06-29T10:00:00Z"
}
```

### GET /courses/:courseId
Get detailed course information with lessons.

**Headers:**
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "Complete Guide to Pointers in C++",
    "description": "Master C++ pointers from basics to advanced concepts",
    "difficulty": "beginner",
    "status": "completed",
    "estimatedDuration": 180,
    "lessons": [
      {
        "id": "uuid",
        "title": "Introduction to Pointers",
        "description": "Understanding what pointers are and why they're useful",
        "order": 1,
        "videos": [
          {
            "id": "uuid",
            "title": "C++ Pointers Explained",
            "youtubeId": "dQw4w9WgXcQ",
            "duration": 720,
            "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
          }
        ],
        "quiz": {
          "id": "uuid",
          "questions": [
            {
              "id": "uuid",
              "question": "What is a pointer in C++?",
              "type": "multiple_choice",
              "options": [
                "A variable that stores memory address",
                "A function that points to data",
                "A data type for text",
                "A loop construct"
              ],
              "correctAnswer": 0
            }
          ]
        }
      }
    ],
    "createdAt": "2025-06-29T10:00:00Z",
    "updatedAt": "2025-06-29T10:15:00Z"
  },
  "timestamp": "2025-06-29T10:00:00Z"
}
```

### DELETE /courses/:courseId
Delete a course (soft delete).

**Headers:**
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Course deleted successfully",
  "data": {
    "message": "Course deleted successfully"
  },
  "timestamp": "2025-06-29T10:00:00Z"
}
```

## Database Structure

### Tables Created:
- `courses` - Main course information
- `lessons` - Course lessons with order
- `videos` - YouTube videos for lessons
- `quizzes` - Quiz containers for lessons
- `questions` - Individual quiz questions

### Relationships:
- User → Courses (One-to-Many)
- Course → Lessons (One-to-Many)
- Lesson → Videos (One-to-Many)
- Lesson → Quiz (One-to-One)
- Quiz → Questions (One-to-Many)

## Enums

### CourseDifficulty
- `beginner`
- `intermediate`
- `advanced`

### CourseStatus
- `generating`
- `completed`
- `failed`

### QuestionType
- `multiple_choice`
- `true_false`
- `short_answer`

## Files Structure

```
src/modules/courses/
├── dto/
│   ├── generate-course.dto.ts
│   ├── get-courses.dto.ts
│   └── index.ts
├── courses.controller.ts
├── courses.service.ts
├── courses.repository.ts
└── courses.module.ts

src/database/entities/
├── course.entity.ts
├── lesson.entity.ts
├── video.entity.ts
├── quiz.entity.ts
└── question.entity.ts

src/database/migrations/
└── 1735462800000-CreateCourseTables.ts

src/common/enums/
├── course-difficulty.enum.ts
├── course-status.enum.ts
└── question-type.enum.ts
```

## Usage

1. **Course Generation**: Users can generate courses by providing a prompt and difficulty level
2. **Course Management**: Users can view, search, and delete their courses
3. **Detailed View**: Users can access detailed course information including lessons, videos, and quizzes
4. **Pagination**: Large course lists are paginated for better performance
5. **Background Processing**: Course generation happens in the background (simulated with setTimeout)

## Future Enhancements

- Integration with AI services for actual course content generation
- Progress tracking for course completion
- User enrollment and sharing capabilities
- Course ratings and reviews
- Advanced search with filters
- Course templates and categories
- Video upload support
- Interactive quizzes with scoring
- Certificates of completion
