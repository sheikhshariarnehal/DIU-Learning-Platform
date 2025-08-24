-- ============================================================================
-- SUPABASE DATABASE SCHEMA - DIU LEARNING PLATFORM
-- Enhanced All-in-One Creator System
-- ============================================================================
-- Version: 1.0
-- Created: 2025-01-22
-- Purpose: Complete database schema for backup and migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. SEMESTERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    section TEXT NOT NULL,
    has_midterm BOOLEAN DEFAULT true,
    has_final BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT semesters_title_check CHECK (length(title) >= 1),
    CONSTRAINT semesters_section_check CHECK (length(section) >= 1),
    CONSTRAINT semesters_date_check CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- ============================================================================
-- 2. COURSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    course_code TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    teacher_email TEXT,
    credits INTEGER DEFAULT 3,
    description TEXT,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    is_highlighted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT courses_title_check CHECK (length(title) >= 1),
    CONSTRAINT courses_code_check CHECK (length(course_code) >= 1),
    CONSTRAINT courses_teacher_check CHECK (length(teacher_name) >= 1),
    CONSTRAINT courses_credits_check CHECK (credits > 0 AND credits <= 10),
    CONSTRAINT courses_email_check CHECK (teacher_email IS NULL OR teacher_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add comment and index for course highlighting
COMMENT ON COLUMN courses.is_highlighted IS 'Indicates if the course should be highlighted/featured in the user interface';
CREATE INDEX IF NOT EXISTS idx_courses_is_highlighted ON courses(is_highlighted) WHERE is_highlighted = true;

-- ============================================================================
-- 3. TOPICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT topics_title_check CHECK (length(title) >= 1),
    CONSTRAINT topics_order_check CHECK (order_index >= 0)
);

-- ============================================================================
-- 4. SLIDES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    google_drive_url TEXT NOT NULL,
    description TEXT,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    file_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT slides_title_check CHECK (length(title) >= 1),
    CONSTRAINT slides_url_check CHECK (length(google_drive_url) >= 1),
    CONSTRAINT slides_order_check CHECK (order_index >= 0)
);

-- ============================================================================
-- 5. VIDEOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT videos_title_check CHECK (length(title) >= 1),
    CONSTRAINT videos_url_check CHECK (length(youtube_url) >= 1),
    CONSTRAINT videos_order_check CHECK (order_index >= 0)
);

-- ============================================================================
-- 6. STUDY TOOLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content_url TEXT NOT NULL,
    description TEXT,
    exam_type TEXT NOT NULL,
    file_size TEXT,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT study_tools_title_check CHECK (length(title) >= 1),
    CONSTRAINT study_tools_type_check CHECK (type IN ('PDF', 'DOC', 'PPT', 'XLS', 'TXT', 'ZIP', 'OTHER')),
    CONSTRAINT study_tools_url_check CHECK (length(content_url) >= 1),
    CONSTRAINT study_tools_exam_check CHECK (exam_type IN ('midterm', 'final', 'quiz', 'assignment', 'project', 'other'))
);

-- ============================================================================
-- 7. ADMIN USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT admin_users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT admin_users_name_check CHECK (length(name) >= 1),
    CONSTRAINT admin_users_role_check CHECK (role IN ('admin', 'super_admin', 'editor'))
);

-- ============================================================================
-- 8. ADMIN SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT admin_sessions_token_check CHECK (length(session_token) >= 32),
    CONSTRAINT admin_sessions_expires_check CHECK (expires_at > created_at)
);

-- ============================================================================
-- 9. CONTENT ANALYTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    user_ip INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT content_analytics_type_check CHECK (content_type IN ('slide', 'video', 'study_tool')),
    CONSTRAINT content_analytics_action_check CHECK (action_type IN ('view', 'download', 'share'))
);

-- ============================================================================
-- 10. SYSTEM LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    admin_user_id UUID REFERENCES admin_users(id),
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT system_logs_level_check CHECK (level IN ('info', 'warning', 'error', 'debug')),
    CONSTRAINT system_logs_message_check CHECK (length(message) >= 1)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Semesters indexes
CREATE INDEX IF NOT EXISTS idx_semesters_section ON semesters(section);
CREATE INDEX IF NOT EXISTS idx_semesters_created_at ON semesters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_semesters_updated_at ON semesters(updated_at DESC);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_name);

-- Topics indexes
CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(course_id, order_index);

-- Slides indexes
CREATE INDEX IF NOT EXISTS idx_slides_topic_id ON slides(topic_id);
CREATE INDEX IF NOT EXISTS idx_slides_order ON slides(topic_id, order_index);

-- Videos indexes
CREATE INDEX IF NOT EXISTS idx_videos_topic_id ON videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(topic_id, order_index);

-- Study tools indexes
CREATE INDEX IF NOT EXISTS idx_study_tools_course_id ON study_tools(course_id);
CREATE INDEX IF NOT EXISTS idx_study_tools_type ON study_tools(type);
CREATE INDEX IF NOT EXISTS idx_study_tools_exam_type ON study_tools(exam_type);

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Admin sessions indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_created_at ON content_analytics(created_at DESC);

-- System logs indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_admin_user ON system_logs(admin_user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_tools_updated_at BEFORE UPDATE ON study_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name, role) VALUES 
('admin@diu.edu.bd', '$2b$10$rQZ8kHWKQYXyQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ', 'System Administrator', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 DATABASE SCHEMA CREATED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '   • semesters (main semester data)';
    RAISE NOTICE '   • courses (semester courses)';
    RAISE NOTICE '   • topics (course topics)';
    RAISE NOTICE '   • slides (topic slides)';
    RAISE NOTICE '   • videos (topic videos)';
    RAISE NOTICE '   • study_tools (course study materials)';
    RAISE NOTICE '   • admin_users (system administrators)';
    RAISE NOTICE '   • admin_sessions (admin login sessions)';
    RAISE NOTICE '   • content_analytics (usage tracking)';
    RAISE NOTICE '   • system_logs (system activity logs)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Features Enabled:';
    RAISE NOTICE '   • UUID primary keys';
    RAISE NOTICE '   • Cascading deletes';
    RAISE NOTICE '   • Data validation constraints';
    RAISE NOTICE '   • Performance indexes';
    RAISE NOTICE '   • Auto-updating timestamps';
    RAISE NOTICE '   • Sample admin user';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for Enhanced All-in-One Creator!';
    RAISE NOTICE '';
END $$;
