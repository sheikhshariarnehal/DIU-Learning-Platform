---
type: "manual"
---

Based on your requirements, here's a comprehensive structure for your educational platform:

## Database Schema

### Core Models

**Semester Model:**
- `id`: Primary key
- `title`: String (e.g., "Spring 2025")
- `description`: Text
- `section`: String (e.g., "63_G", "63_C")
- `has_midterm`: Boolean
- `has_final`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Course Model:**
- `id`: Primary key
- `title`: String
- `course_code`: String (e.g., "CSE101")
- `teacher_name`: String
- `semester_id`: Foreign key to Semester
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Topic Model:**
- `id`: Primary key
- `title`: String
- `course_id`: Foreign key to Course
- `order`: Integer (for sorting)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Slide Model:**
- `id`: Primary key
- `title`: String
- `google_drive_url`: String (for preview)
- `topic_id`: Foreign key to Topic
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Video Model:**
- `id`: Primary key
- `title`: String
- `youtube_url`: String
- `topic_id`: Foreign key to Topic
- `created_at`: Timestamp
- `updated_at`: Timestamp

**StudyTool Model:**
- `id`: Primary key
- `title`: String
- `type`: Enum ('previous_questions', 'exam_note', 'syllabus', 'mark_distribution')
- `content`: Text or File URL
- `course_id`: Foreign key to Course
- `exam_type`: Enum ('midterm', 'final', 'both')
- `created_at`: Timestamp
- `updated_at`: Timestamp

## User Interface Structure

### Main Navigation Flow

1. **Semester Selection**
   - Display available semesters with sections
   - Show exam types (Midterm/Final) for each semester

2. **Course Listing**
   - Show all courses within selected semester
   - Display course code, title, and teacher name

3. **Course Expansion (Two Categories)**
   - **Study Tools Section**
     - Previous Questions
     - Exam Notes
     - Syllabus for Exam
     - Mark Distribution
   - **Topics Section**
     - List all topics with expandable items
     - Each topic contains slides and video lectures

### Key Features

## Expandable Interface Design

**Course Level:**
```
📚 Course Title (Course Code) - Teacher Name
├── 🛠️ Study Tools [Expandable]
│   ├── 📝 Previous Questions
│   ├── 📋 Exam Notes
│   ├── 📖 Syllabus for Exam
│   └── 📊 Mark Distribution
└── 📑 Topics [Expandable]
    ├── Topic 1 [Expandable]
    │   ├── 🎯 Slides
    │   └── 🎥 Video Lectures
    └── Topic 2 [Expandable]
        ├── 🎯 Slides
        └── 🎥 Video Lectures
```

## Functional Requirements

### Content Management
- **Dynamic Study Tools**: Admin can add new study tools at any time
- **Flexible Content**: Support for multiple file types and URLs
- **Easy Updates**: Quick editing of existing content

### User Experience
- **Left Panel Display**: Lecture videos and topic slides open in left sidebar
- **Responsive Design**: Works on desktop and mobile devices
- **Quick Navigation**: Breadcrumb navigation for easy backtracking

### Technical Implementation

**Frontend Components:**
- Collapsible/Expandable UI elements
- Embedded Google Drive viewer for slides
- Embedded YouTube player for videos
- File download functionality for study materials

**Backend API Endpoints:**
- `GET /semesters` - List all semesters
- `GET /semesters/{id}/courses` - Get courses for semester
- `GET /courses/{id}/study-tools` - Get study tools for course
- `GET /courses/{id}/topics` - Get topics for course
- `POST /courses/{id}/study-tools` - Add new study tool
- `GET /topics/{id}/materials` - Get slides and videos for topic

This structure provides a scalable, user-friendly educational platform that meets all your specified requirements while allowing for future expansion and customization.