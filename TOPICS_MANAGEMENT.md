# Topics Management System

A comprehensive topics management system for the learning platform that allows administrators to create, manage, and organize course content with topics, slides, and videos.

## Features

### 🎯 Core Functionality
- **Topics Management**: Create, edit, and delete topics for any course
- **Content Organization**: Each topic can contain multiple slides and video lectures
- **Unique Validation**: Ensures topic titles are unique within courses and content titles are unique within topics
- **Hierarchical Structure**: Course → Topics → Slides/Videos

### 🛠️ Admin Interface
- **Intuitive Dashboard**: Easy-to-use admin interface for managing topics
- **Course-Specific Management**: Dedicated topics management for each course
- **Content Management**: Add, edit, remove, and reorder slides and videos
- **Bulk Operations**: Sort, clear, and duplicate content efficiently
- **Real-time Validation**: Immediate feedback on validation errors

### 👥 User Interface
- **Enhanced Navigation**: Improved course browsing with topic organization
- **Content Indicators**: Visual indicators showing available slides and videos
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Progress Tracking**: Shows content availability and completion status

## Database Schema

### Tables

#### Topics
```sql
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_topic_title_per_section UNIQUE(title, section_id)
);
```

#### Slides
```sql
CREATE TABLE slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    slide_url TEXT NOT NULL,
    slide_type VARCHAR(20) NOT NULL CHECK (slide_type IN ('pdf', 'ppt', 'image')) DEFAULT 'pdf',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_slide_title_per_topic UNIQUE(title, topic_id)
);
```

#### Videos
```sql
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    duration VARCHAR(20),
    thumbnail_url TEXT,
    video_type VARCHAR(20) NOT NULL CHECK (video_type IN ('youtube', 'vimeo', 'direct')) DEFAULT 'youtube',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_video_title_per_topic UNIQUE(title, topic_id)
);
```

## API Endpoints

### Validation API
- **POST** `/api/topics/validate` - Validate topic, slide, or video data
- Supports real-time validation with uniqueness checks
- Returns detailed validation errors with error codes

### Bulk Operations API
- **POST** `/api/topics/bulk` - Perform bulk operations
- Supported operations:
  - `reorder_topics` - Reorder topics within a section
  - `bulk_update_topics` - Update multiple topics at once
  - `duplicate_topic` - Duplicate a topic with all its content
  - `reorder_slides` - Reorder slides within a topic

### Search API
- **GET** `/api/topics/search` - Search and filter topics
- **POST** `/api/topics/search` - Advanced search with complex filters
- Supports pagination, sorting, and content filtering

### Statistics API
- **GET** `/api/topics/stats` - Get topic statistics
- Supports course-level, section-level, and global statistics
- Provides content counts and activity metrics

## Usage

### Admin Interface

#### Managing Topics
1. Navigate to **Admin → Courses**
2. Click the settings icon next to any course
3. Use the topics management interface to:
   - Add new topics
   - Edit existing topics
   - Delete topics (with confirmation)
   - Reorder topics

#### Managing Content
1. In the topics admin interface, click "Edit" on any topic
2. Use the tabs to switch between slides and videos
3. Add content with optional titles
4. Use reordering controls to organize content
5. Use bulk operations for efficiency

### User Interface

#### Browsing Topics
1. Select a course from the sidebar
2. Expand topics to see available content
3. Click on slides or videos to view them
4. Use the content indicators to see what's available

## Validation Rules

### Topics
- **Title**: Required, 3-255 characters, unique within section
- **Description**: Optional, max 1000 characters
- **Order**: Must be positive number
- **Section**: Required, must exist

### Slides
- **Title**: Optional, max 255 characters, unique within topic if provided
- **URL**: Required, must be valid URL
- **Type**: Must be 'pdf', 'ppt', or 'image'

### Videos
- **Title**: Optional, max 255 characters, unique within topic if provided
- **URL**: Required, must be valid URL
- **Type**: Must be 'youtube', 'vimeo', or 'direct'
- **Duration**: Optional, format MM:SS or HH:MM:SS
- **Thumbnail**: Optional, must be valid URL if provided

## Error Handling

### Database Errors
- **23505**: Unique constraint violation (duplicate titles)
- **23503**: Foreign key constraint violation (invalid references)
- **42501**: Permission denied
- **42P01**: Table not found (setup required)

### Validation Errors
- **REQUIRED**: Missing required field
- **MIN_LENGTH**: Value too short
- **MAX_LENGTH**: Value too long
- **DUPLICATE**: Unique constraint violation
- **INVALID_URL**: Malformed URL
- **INVALID_VALUE**: Invalid enum value
- **INVALID_FORMAT**: Wrong format (e.g., duration)

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Coverage
- **Validation Functions**: Unit tests for all validation logic
- **API Endpoints**: Integration tests for all API routes
- **Error Handling**: Tests for various error scenarios
- **Performance**: Tests for large data sets and batch operations

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Proper foreign key relationships
- Efficient query patterns

### Frontend Optimization
- Lazy loading of content
- Efficient state management
- Optimized re-rendering

### API Optimization
- Pagination for large datasets
- Batch operations for bulk updates
- Caching for frequently accessed data

## Security

### Authentication
- Admin functions require proper authentication
- User access is controlled by permissions

### Validation
- Server-side validation for all inputs
- SQL injection prevention
- XSS protection

### Data Integrity
- Foreign key constraints
- Unique constraints
- Proper error handling

## Future Enhancements

### Planned Features
- Drag-and-drop reordering
- Content versioning
- Advanced search filters
- Content analytics
- Export/import functionality

### Performance Improvements
- Database query optimization
- Caching strategies
- Background processing for bulk operations

### User Experience
- Better mobile experience
- Keyboard shortcuts
- Accessibility improvements
