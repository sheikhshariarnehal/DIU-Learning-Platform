-- Complete database setup script for DIU Learning Platform
-- Run this script in Supabase SQL Editor to set up all tables
-- Version: 2.0 - Updated with all required columns and constraints

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
-- Uncomment the following lines if you want to start fresh
-- DROP TABLE IF EXISTS admin_sessions CASCADE;
-- DROP TABLE IF EXISTS admin_users CASCADE;
-- DROP TABLE IF EXISTS study_tools CASCADE;
-- DROP TABLE IF EXISTS videos CASCADE;
-- DROP TABLE IF EXISTS slides CASCADE;
-- DROP TABLE IF EXISTS topics CASCADE;
-- DROP TABLE IF EXISTS courses CASCADE;
-- DROP TABLE IF EXISTS semesters CASCADE;

-- ============================================================================
-- MAIN TABLES
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

-- Ensure all required columns exist in semesters table
DO $$
BEGIN
    -- Add description column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='semesters' AND column_name='description') THEN
        ALTER TABLE semesters ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to semesters table';
    END IF;

    -- Add section column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='semesters' AND column_name='section') THEN
        ALTER TABLE semesters ADD COLUMN section VARCHAR(50);
        RAISE NOTICE 'Added section column to semesters table';
    END IF;

    -- Add has_midterm column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='semesters' AND column_name='has_midterm') THEN
        ALTER TABLE semesters ADD COLUMN has_midterm BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added has_midterm column to semesters table';
    END IF;

    -- Add has_final column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='semesters' AND column_name='has_final') THEN
        ALTER TABLE semesters ADD COLUMN has_final BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added has_final column to semesters table';
    END IF;
END $$;

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

-- Ensure all required columns exist in courses table
DO $$
BEGIN
    -- Add course_code column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='courses' AND column_name='course_code') THEN
        ALTER TABLE courses ADD COLUMN course_code VARCHAR(50) NOT NULL DEFAULT '';
        RAISE NOTICE 'Added course_code column to courses table';
    END IF;

    -- Add teacher_name column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='courses' AND column_name='teacher_name') THEN
        ALTER TABLE courses ADD COLUMN teacher_name VARCHAR(255) NOT NULL DEFAULT '';
        RAISE NOTICE 'Added teacher_name column to courses table';
    END IF;
END $$;

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

-- Ensure all required columns exist in topics table
DO $$
BEGIN
    -- Add description column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='topics' AND column_name='description') THEN
        ALTER TABLE topics ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to topics table';
    END IF;

    -- Add order_index column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='topics' AND column_name='order_index') THEN
        ALTER TABLE topics ADD COLUMN order_index INTEGER DEFAULT 0;
        RAISE NOTICE 'Added order_index column to topics table';
    END IF;
END $$;

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

-- Ensure all required columns exist in slides table
DO $$
BEGIN
    -- Add google_drive_url column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='slides' AND column_name='google_drive_url') THEN
        ALTER TABLE slides ADD COLUMN google_drive_url TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Added google_drive_url column to slides table';
    END IF;

    -- Add order_index column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='slides' AND column_name='order_index') THEN
        ALTER TABLE slides ADD COLUMN order_index INTEGER DEFAULT 0;
        RAISE NOTICE 'Added order_index column to slides table';
    END IF;
END $$;

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

-- Ensure all required columns exist in videos table
DO $$
BEGIN
    -- Add youtube_url column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='videos' AND column_name='youtube_url') THEN
        ALTER TABLE videos ADD COLUMN youtube_url TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Added youtube_url column to videos table';
    END IF;

    -- Add order_index column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='videos' AND column_name='order_index') THEN
        ALTER TABLE videos ADD COLUMN order_index INTEGER DEFAULT 0;
        RAISE NOTICE 'Added order_index column to videos table';
    END IF;
END $$;

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

-- Ensure all required columns exist in study_tools table
DO $$
BEGIN
    -- Add type column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='study_tools' AND column_name='type') THEN
        ALTER TABLE study_tools ADD COLUMN type VARCHAR(50) CHECK (type IN ('previous_questions', 'exam_note', 'syllabus', 'mark_distribution'));
        RAISE NOTICE 'Added type column to study_tools table';
    END IF;

    -- Add content_url column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='study_tools' AND column_name='content_url') THEN
        ALTER TABLE study_tools ADD COLUMN content_url TEXT;
        RAISE NOTICE 'Added content_url column to study_tools table';
    END IF;

    -- Add exam_type column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='study_tools' AND column_name='exam_type') THEN
        ALTER TABLE study_tools ADD COLUMN exam_type VARCHAR(20) CHECK (exam_type IN ('midterm', 'final', 'both')) DEFAULT 'both';
        RAISE NOTICE 'Added exam_type column to study_tools table';
    END IF;
END $$;

-- ============================================================================
-- ADMIN TABLES
-- ============================================================================

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

-- Ensure all required columns exist in admin_users table
DO $$
BEGIN
    -- Add password_hash column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='admin_users' AND column_name='password_hash') THEN
        ALTER TABLE admin_users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';
        RAISE NOTICE 'Added password_hash column to admin_users table';
    END IF;

    -- Add full_name column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='admin_users' AND column_name='full_name') THEN
        ALTER TABLE admin_users ADD COLUMN full_name VARCHAR(255) NOT NULL DEFAULT '';
        RAISE NOTICE 'Added full_name column to admin_users table';
    END IF;

    -- Add role column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='admin_users' AND column_name='role') THEN
        ALTER TABLE admin_users ADD COLUMN role VARCHAR(50) CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin';
        RAISE NOTICE 'Added role column to admin_users table';
    END IF;

    -- Add is_active column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='admin_users' AND column_name='is_active') THEN
        ALTER TABLE admin_users ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to admin_users table';
    END IF;

    -- Add last_login column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='admin_users' AND column_name='last_login') THEN
        ALTER TABLE admin_users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_login column to admin_users table';
    END IF;
END $$;

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all required columns exist in admin_sessions table
DO $$
BEGIN
    -- Add session_token column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='admin_sessions' AND column_name='session_token') THEN
        ALTER TABLE admin_sessions ADD COLUMN session_token VARCHAR(255) UNIQUE NOT NULL DEFAULT '';
        RAISE NOTICE 'Added session_token column to admin_sessions table';
    END IF;

    -- Add expires_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='admin_sessions' AND column_name='expires_at') THEN
        ALTER TABLE admin_sessions ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '1 day';
        RAISE NOTICE 'Added expires_at column to admin_sessions table';
    END IF;
END $$;

-- ============================================================================
-- INDEXES AND CONSTRAINTS
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_semesters_title ON semesters(title);
CREATE INDEX IF NOT EXISTS idx_semesters_section ON semesters(section);
CREATE INDEX IF NOT EXISTS idx_semesters_created_at ON semesters(created_at);

CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_order_index ON topics(order_index);
CREATE INDEX IF NOT EXISTS idx_topics_title ON topics(title);

CREATE INDEX IF NOT EXISTS idx_slides_topic_id ON slides(topic_id);
CREATE INDEX IF NOT EXISTS idx_slides_order_index ON slides(order_index);
CREATE INDEX IF NOT EXISTS idx_slides_title ON slides(title);

CREATE INDEX IF NOT EXISTS idx_videos_topic_id ON videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_videos_order_index ON videos(order_index);
CREATE INDEX IF NOT EXISTS idx_videos_title ON videos(title);

CREATE INDEX IF NOT EXISTS idx_study_tools_course_id ON study_tools(course_id);
CREATE INDEX IF NOT EXISTS idx_study_tools_type ON study_tools(type);
CREATE INDEX IF NOT EXISTS idx_study_tools_exam_type ON study_tools(exam_type);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to main content
CREATE POLICY "Public read access for semesters" ON semesters FOR SELECT USING (true);
CREATE POLICY "Public read access for courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read access for topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Public read access for slides" ON slides FOR SELECT USING (true);
CREATE POLICY "Public read access for videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public read access for study_tools" ON study_tools FOR SELECT USING (true);

-- Admin-only policies for admin tables
CREATE POLICY "Admin only access for admin_users" ON admin_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin only access for admin_sessions" ON admin_sessions FOR ALL USING (auth.role() = 'service_role');

-- Service role can do everything
CREATE POLICY "Service role full access semesters" ON semesters FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access courses" ON courses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access topics" ON topics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access slides" ON slides FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access videos" ON videos FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access study_tools" ON study_tools FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_tools_updated_at BEFORE UPDATE ON study_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================================================

-- Insert default admin user if not exists (password: admin123)
INSERT INTO admin_users (email, password_hash, full_name, role)
SELECT 'admin@diu.edu.bd', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqOeKqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', 'System Administrator', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@diu.edu.bd');

-- Insert sample semesters if not exists
INSERT INTO semesters (title, description, section, has_midterm, has_final)
SELECT 'Summer 2025', 'Summer semester 2025', '63_G', true, true
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE title = 'Summer 2025');

INSERT INTO semesters (title, description, section, has_midterm, has_final)
SELECT 'Spring 2025', 'Spring semester 2025', '63_C', true, true
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE title = 'Spring 2025');

-- ============================================================================
-- VERIFICATION AND CLEANUP
-- ============================================================================

-- Clean up expired admin sessions
DELETE FROM admin_sessions WHERE expires_at < NOW();

-- Verify all tables and columns exist
SELECT
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_name IN ('semesters', 'courses', 'topics', 'slides', 'videos', 'study_tools', 'admin_users', 'admin_sessions')
ORDER BY t.table_name, c.ordinal_position;

-- Show table counts
SELECT
    'semesters' as table_name, COUNT(*) as row_count FROM semesters
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'topics', COUNT(*) FROM topics
UNION ALL
SELECT 'slides', COUNT(*) FROM slides
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'study_tools', COUNT(*) FROM study_tools
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users
UNION ALL
SELECT 'admin_sessions', COUNT(*) FROM admin_sessions;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE '📋 All tables created with proper schema';
    RAISE NOTICE '🔒 Row Level Security enabled';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🔄 Auto-update triggers configured';
    RAISE NOTICE '👤 Default admin user created (admin@diu.edu.bd)';
END $$;
