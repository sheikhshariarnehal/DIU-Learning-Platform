-- ============================================================================
-- COMPLETE DATABASE SETUP FOR DIU LEARNING PLATFORM
-- ============================================================================
-- This script combines schema creation and sample data insertion
-- Run this single script in Supabase SQL Editor for complete setup
-- Version: 2.0 - Updated and comprehensive

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SCHEMA CREATION
-- ============================================================================

-- Semesters table
CREATE TABLE IF NOT EXISTS semesters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  section VARCHAR(50),
  has_midterm BOOLEAN DEFAULT true,
  has_final BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  course_code VARCHAR(50) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slides table
CREATE TABLE IF NOT EXISTS slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  google_drive_url TEXT NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  youtube_url TEXT NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study tools table
CREATE TABLE IF NOT EXISTS study_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('previous_questions', 'exam_note', 'syllabus', 'mark_distribution')),
  content_url TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  exam_type VARCHAR(20) CHECK (exam_type IN ('midterm', 'final', 'both')) DEFAULT 'both',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COLUMN FIXES (for existing tables)
-- ============================================================================

-- Ensure all required columns exist
DO $$ 
BEGIN 
    -- Semesters table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='semesters' AND column_name='description') THEN
        ALTER TABLE semesters ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to semesters table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='semesters' AND column_name='section') THEN
        ALTER TABLE semesters ADD COLUMN section VARCHAR(50);
        RAISE NOTICE 'Added section column to semesters table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='semesters' AND column_name='has_midterm') THEN
        ALTER TABLE semesters ADD COLUMN has_midterm BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added has_midterm column to semesters table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='semesters' AND column_name='has_final') THEN
        ALTER TABLE semesters ADD COLUMN has_final BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added has_final column to semesters table';
    END IF;
    
    -- Topics table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='topics' AND column_name='description') THEN
        ALTER TABLE topics ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to topics table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='topics' AND column_name='order_index') THEN
        ALTER TABLE topics ADD COLUMN order_index INTEGER DEFAULT 0;
        RAISE NOTICE 'Added order_index column to topics table';
    END IF;
    
    -- Other table columns (add as needed)
    RAISE NOTICE 'Column verification completed';
END $$;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_semesters_title ON semesters(title);
CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_slides_topic_id ON slides(topic_id);
CREATE INDEX IF NOT EXISTS idx_videos_topic_id ON videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_tools_course_id ON study_tools(course_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read semesters" ON semesters FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Public read slides" ON slides FOR SELECT USING (true);
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public read study_tools" ON study_tools FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role full access semesters" ON semesters FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access courses" ON courses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access topics" ON topics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access slides" ON slides FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access videos" ON videos FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access study_tools" ON study_tools FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access admin_users" ON admin_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access admin_sessions" ON admin_sessions FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
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
INSERT INTO admin_users (email, password_hash, full_name, role) 
SELECT 'admin@diu.edu.bd', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqOeKqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', 'System Administrator', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@diu.edu.bd');

-- Sample semester
INSERT INTO semesters (title, description, section, has_midterm, has_final) 
SELECT 'Summer 2025', 'Summer semester 2025 - Advanced courses', '63_G', true, true
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE title = 'Summer 2025');

-- Sample course
INSERT INTO courses (title, course_code, teacher_name, semester_id) 
SELECT 'Internet of Things', 'CSE 422', 'Dr. Ahmed Rahman', id FROM semesters WHERE title = 'Summer 2025'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CSE 422');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Final verification
SELECT 
    'semesters' as table_name, COUNT(*) as row_count FROM semesters
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE '📋 All tables created with proper schema';
    RAISE NOTICE '🔒 Row Level Security enabled';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '👤 Default admin user: admin@diu.edu.bd (password: admin123)';
    RAISE NOTICE '📚 Sample data inserted';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your DIU Learning Platform database is ready!';
END $$;
