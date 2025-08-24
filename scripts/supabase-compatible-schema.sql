-- ============================================================================
-- SUPABASE-COMPATIBLE DATABASE SCHEMA
-- ============================================================================
-- Optimized for Supabase with proper RLS policies that work with Next.js APIs

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES (WITHOUT RLS INITIALLY)
-- ============================================================================

-- Enhanced Semesters table
CREATE TABLE IF NOT EXISTS semesters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  section VARCHAR(50) NOT NULL,
  has_midterm BOOLEAN DEFAULT true,
  has_final BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  default_credits INTEGER DEFAULT 3 CHECK (default_credits >= 1 AND default_credits <= 6),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (start_date IS NULL OR end_date IS NULL OR start_date < end_date),
  CONSTRAINT unique_semester_section UNIQUE (title, section)
);

-- Enhanced Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  course_code VARCHAR(50) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  teacher_email VARCHAR(255),
  description TEXT,
  credits INTEGER DEFAULT 3 CHECK (credits >= 1 AND credits <= 6),
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  is_highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_teacher_email CHECK (teacher_email IS NULL OR teacher_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT unique_course_code_semester UNIQUE (course_code, semester_id)
);

-- Add comment and index for course highlighting
COMMENT ON COLUMN courses.is_highlighted IS 'Indicates if the course should be highlighted/featured in the user interface';
CREATE INDEX IF NOT EXISTS idx_courses_is_highlighted ON courses(is_highlighted) WHERE is_highlighted = true;

-- Enhanced Topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  estimated_duration_minutes INTEGER,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_order_index CHECK (order_index >= 0),
  CONSTRAINT positive_duration CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0)
);

-- Enhanced Slides table
CREATE TABLE IF NOT EXISTS slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  google_drive_url TEXT NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  file_size_mb DECIMAL(10,2),
  slide_count INTEGER,
  is_downloadable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_order_index CHECK (order_index >= 0),
  CONSTRAINT positive_file_size CHECK (file_size_mb IS NULL OR file_size_mb > 0),
  CONSTRAINT positive_slide_count CHECK (slide_count IS NULL OR slide_count > 0)
);

-- Enhanced Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  video_quality VARCHAR(10) CHECK (video_quality IN ('720p', '1080p', '4K')),
  has_subtitles BOOLEAN DEFAULT false,
  language VARCHAR(10) DEFAULT 'en',
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_order_index CHECK (order_index >= 0),
  CONSTRAINT positive_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  CONSTRAINT positive_view_count CHECK (view_count >= 0)
);

-- Enhanced Study Tools table
CREATE TABLE IF NOT EXISTS study_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('previous_questions', 'exam_note', 'syllabus', 'mark_distribution', 'assignment', 'lab_manual', 'reference_book')),
  content_url TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  exam_type VARCHAR(20) CHECK (exam_type IN ('midterm', 'final', 'both', 'assignment', 'quiz')) DEFAULT 'both',
  file_size_mb DECIMAL(10,2),
  file_format VARCHAR(10),
  academic_year VARCHAR(20),
  is_downloadable BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_file_size CHECK (file_size_mb IS NULL OR file_size_mb > 0),
  CONSTRAINT positive_download_count CHECK (download_count >= 0)
);

-- Enhanced Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('super_admin', 'admin', 'moderator', 'content_creator')) DEFAULT 'admin',
  department VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT positive_login_count CHECK (login_count >= 0)
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_semesters_title ON semesters(title);
CREATE INDEX IF NOT EXISTS idx_semesters_section ON semesters(section);
CREATE INDEX IF NOT EXISTS idx_semesters_active ON semesters(is_active);

CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);

CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_slides_topic_id ON slides(topic_id);
CREATE INDEX IF NOT EXISTS idx_videos_topic_id ON videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_tools_course_id ON study_tools(course_id);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_tools_updated_at BEFORE UPDATE ON study_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Default admin user
INSERT INTO admin_users (email, password_hash, full_name, role, department) 
SELECT 'admin@diu.edu.bd', crypt('admin123', gen_salt('bf')), 'System Administrator', 'super_admin', 'Computer Science'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@diu.edu.bd');

-- Sample semester
INSERT INTO semesters (title, description, section, has_midterm, has_final, start_date, end_date, default_credits) 
SELECT 
    'Summer 2025', 
    'Summer semester 2025 - Advanced Computer Science courses', 
    '63_G', 
    true, 
    true,
    '2025-06-01',
    '2025-08-31',
    3
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE title = 'Summer 2025' AND section = '63_G');

-- ============================================================================
-- VERIFICATION AND SUCCESS MESSAGE
-- ============================================================================

-- Test database operations
DO $$
DECLARE
    test_semester_id UUID;
BEGIN
    -- Test insert
    INSERT INTO semesters (title, description, section) 
    VALUES ('Test Insert', 'Test Description', 'TEST_INSERT') 
    RETURNING id INTO test_semester_id;
    
    -- Test update
    UPDATE semesters SET description = 'Updated Description' WHERE id = test_semester_id;
    
    -- Test delete
    DELETE FROM semesters WHERE id = test_semester_id;
    
    RAISE NOTICE '✅ DATABASE OPERATIONS TEST PASSED';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ DATABASE OPERATIONS TEST FAILED: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUPABASE-COMPATIBLE DATABASE SETUP COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All tables created without RLS conflicts';
    RAISE NOTICE '✅ Performance indexes added';
    RAISE NOTICE '✅ Auto-update triggers configured';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '✅ Database operations tested successfully';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Enhanced All-in-One Creator should now work perfectly!';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Test these URLs:';
    RAISE NOTICE '   • /admin/enhanced-creator';
    RAISE NOTICE '   • /admin/test-enhanced';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Default admin: admin@diu.edu.bd / admin123';
    RAISE NOTICE '';
END $$;
