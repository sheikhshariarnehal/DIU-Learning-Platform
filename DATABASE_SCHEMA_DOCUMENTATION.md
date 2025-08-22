# Enhanced Database Schema Documentation

## 📋 Overview

The Enhanced Database Schema for DIU Learning Platform is a comprehensive, production-ready database structure that supports all frontend enhancements and provides advanced features for content management, analytics, and administration.

## 🎯 Key Features

### ✅ **Enhanced Core Tables**
- **Semesters**: Extended with dates, credits, and status management
- **Courses**: Added teacher information, descriptions, and academic details
- **Topics**: Enhanced with ordering, duration, and difficulty levels
- **Slides**: Comprehensive metadata and file management
- **Videos**: Advanced video properties and analytics support
- **Study Tools**: Complete resource management system

### ✅ **Advanced Administration**
- **Role-based Access Control**: Super admin, admin, moderator, content creator
- **Session Management**: Secure session handling with IP tracking
- **Audit Logging**: Complete system change tracking
- **Analytics Support**: Content usage tracking and statistics

### ✅ **Performance & Security**
- **Optimized Indexes**: High-performance queries for all operations
- **Row Level Security**: Granular access control
- **Data Validation**: Comprehensive constraints and checks
- **Auto-triggers**: Automatic timestamp updates and logging

## 📊 Database Tables

### Core Content Tables

#### **semesters**
```sql
- id (UUID, Primary Key)
- title (VARCHAR, Required) - e.g., "Summer 2025"
- description (TEXT) - Detailed semester description
- section (VARCHAR, Required) - e.g., "63_G"
- has_midterm (BOOLEAN) - Midterm exam flag
- has_final (BOOLEAN) - Final exam flag
- start_date (DATE) - Semester start date
- end_date (DATE) - Semester end date
- default_credits (INTEGER) - Default course credits (1-6)
- is_active (BOOLEAN) - Active status
- created_at, updated_at (TIMESTAMP)
```

#### **courses**
```sql
- id (UUID, Primary Key)
- title (VARCHAR, Required) - Course name
- course_code (VARCHAR, Required) - e.g., "CSE 422"
- teacher_name (VARCHAR, Required) - Instructor name
- teacher_email (VARCHAR) - Instructor email (validated)
- description (TEXT) - Course description
- credits (INTEGER) - Course credits (1-6)
- semester_id (UUID, Foreign Key)
- is_active (BOOLEAN) - Active status
- created_at, updated_at (TIMESTAMP)
```

#### **topics**
```sql
- id (UUID, Primary Key)
- title (VARCHAR, Required) - Topic name
- description (TEXT) - Topic description
- course_id (UUID, Foreign Key)
- order_index (INTEGER) - Display order
- estimated_duration_minutes (INTEGER) - Learning duration
- difficulty_level (ENUM) - beginner/intermediate/advanced
- is_published (BOOLEAN) - Publication status
- created_at, updated_at (TIMESTAMP)
```

#### **slides**
```sql
- id (UUID, Primary Key)
- title (VARCHAR, Required) - Slide title
- description (TEXT) - Slide description
- google_drive_url (TEXT, Required) - Google Drive link
- topic_id (UUID, Foreign Key)
- order_index (INTEGER) - Display order
- file_size_mb (DECIMAL) - File size in MB
- slide_count (INTEGER) - Number of slides
- is_downloadable (BOOLEAN) - Download permission
- created_at, updated_at (TIMESTAMP)
```

#### **videos**
```sql
- id (UUID, Primary Key)
- title (VARCHAR, Required) - Video title
- description (TEXT) - Video description
- youtube_url (TEXT, Required) - YouTube link
- topic_id (UUID, Foreign Key)
- order_index (INTEGER) - Display order
- duration_minutes (INTEGER) - Video duration
- video_quality (ENUM) - 720p/1080p/4K
- has_subtitles (BOOLEAN) - Subtitle availability
- language (VARCHAR) - Video language
- is_published (BOOLEAN) - Publication status
- view_count (INTEGER) - View analytics
- created_at, updated_at (TIMESTAMP)
```

#### **study_tools**
```sql
- id (UUID, Primary Key)
- title (VARCHAR, Required) - Resource title
- description (TEXT) - Resource description
- type (ENUM, Required) - Resource type:
  * previous_questions
  * exam_note
  * syllabus
  * mark_distribution
  * assignment
  * lab_manual
  * reference_book
- content_url (TEXT) - Resource URL
- course_id (UUID, Foreign Key)
- exam_type (ENUM) - midterm/final/both/assignment/quiz
- file_size_mb (DECIMAL) - File size
- file_format (VARCHAR) - File format (PDF, DOC, etc.)
- academic_year (VARCHAR) - Academic year
- is_downloadable (BOOLEAN) - Download permission
- download_count (INTEGER) - Download analytics
- created_at, updated_at (TIMESTAMP)
```

### Administrative Tables

#### **admin_users**
```sql
- id (UUID, Primary Key)
- email (VARCHAR, Unique, Required) - Login email
- password_hash (VARCHAR, Required) - Encrypted password
- full_name (VARCHAR, Required) - Full name
- role (ENUM) - super_admin/admin/moderator/content_creator
- department (VARCHAR) - Department/Faculty
- phone (VARCHAR) - Contact number
- is_active (BOOLEAN) - Account status
- last_login (TIMESTAMP) - Last login time
- login_count (INTEGER) - Login analytics
- created_at, updated_at (TIMESTAMP)
```

#### **admin_sessions**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- session_token (VARCHAR, Unique) - Session identifier
- ip_address (INET) - Client IP address
- user_agent (TEXT) - Browser information
- expires_at (TIMESTAMP) - Session expiry
- is_active (BOOLEAN) - Session status
- created_at (TIMESTAMP)
```

### Analytics Tables

#### **content_analytics**
```sql
- id (UUID, Primary Key)
- content_type (ENUM) - slide/video/study_tool
- content_id (UUID) - Content reference
- action_type (ENUM) - view/download/share
- user_ip (INET) - User IP address
- user_agent (TEXT) - Browser information
- session_id (VARCHAR) - Session reference
- created_at (TIMESTAMP)
```

#### **system_logs**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key) - Admin user
- action (VARCHAR) - Action performed
- entity_type (VARCHAR) - Table/entity affected
- entity_id (UUID) - Record ID
- old_values (JSONB) - Previous values
- new_values (JSONB) - New values
- ip_address (INET) - Client IP
- user_agent (TEXT) - Browser info
- created_at (TIMESTAMP)
```

## 🔍 Database Views

### **semester_stats**
Comprehensive semester statistics including:
- Total courses, topics, slides, videos, study tools
- Total credits and duration
- Active content counts

### **course_details**
Detailed course information with:
- Semester information
- Content statistics
- Teacher details
- Total video duration

### **topic_content**
Topic overview with:
- Course and semester context
- Material counts
- Content statistics

## 🛠️ Utility Functions

### **get_semester_stats(semester_uuid)**
Returns comprehensive statistics for a specific semester

### **cleanup_expired_sessions()**
Removes expired admin sessions for security

## 🔒 Security Features

### **Row Level Security (RLS)**
- Public read access to published content
- Service role full access for API operations
- Granular permissions for different user types

### **Data Validation**
- Email format validation
- URL format validation for Google Drive and YouTube
- Date range validation
- Positive number constraints

### **Audit Trail**
- Complete change logging for critical tables
- User action tracking
- IP address and browser logging

## 📈 Performance Optimizations

### **Strategic Indexes**
- Primary key indexes on all tables
- Foreign key indexes for joins
- Composite indexes for common queries
- Date-based indexes for analytics

### **Query Optimization**
- Optimized views for common operations
- Efficient joins and aggregations
- Minimal data transfer

## 🚀 Compatibility

### **Frontend Support**
- ✅ Enhanced All-in-One Creator
- ✅ Original All-in-One Creator
- ✅ All existing admin components
- ✅ Mobile and desktop interfaces

### **API Compatibility**
- ✅ All existing API endpoints
- ✅ Enhanced field support
- ✅ Backward compatibility maintained

## 📦 Installation

1. **Run the Schema**: Execute `scripts/enhanced-database-schema.sql`
2. **Verify Setup**: Check the success messages and table counts
3. **Test Connection**: Use the test pages to verify functionality
4. **Configure Access**: Set up admin users and permissions

## 🎯 Default Data

### **Admin Users**
- `admin@diu.edu.bd` - Super Administrator
- `content@diu.edu.bd` - Content Creator
- Default password: `admin123`

### **Sample Content**
- Summer 2025 semester (Section 63_G)
- Internet of Things course (CSE 422)
- Complete sample content structure

The Enhanced Database Schema provides a robust, scalable foundation for the DIU Learning Platform with comprehensive support for all frontend features and future enhancements.
