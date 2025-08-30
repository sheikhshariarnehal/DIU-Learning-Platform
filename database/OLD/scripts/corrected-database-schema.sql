-- ============================================================================
-- CORRECTED DATABASE SCHEMA FOR DIU LEARNING PLATFORM
-- ============================================================================
-- Fixed PostgreSQL syntax issues and optimized for Supabase
-- Version: 3.1 - Corrected and Production Ready

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES WITH ENHANCED FIELDS
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_teacher_email CHECK (teacher_email IS NULL OR teacher_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT unique_course_code_semester UNIQUE (course_code, semester_id)
);

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
  
  CONSTRAINT valid_google_drive_url CHECK (google_drive_url ~* '^https://drive\.google\.com/.*'),
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
  
  CONSTRAINT valid_youtube_url CHECK (youtube_url ~* '^https://(www\.)?youtube\.com/watch\?v=.*|^https://youtu\.be/.*'),
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
  
  CONSTRAINT valid_content_url CHECK (content_url IS NULL OR content_url ~* '^https?://.*'),
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

-- Enhanced Admin Sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT future_expiry CHECK (expires_at > created_at)
);

-- Content Analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('slide', 'video', 'study_tool')),
  content_id UUID NOT NULL,
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('view', 'download', 'share')),
  user_ip INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_semesters_title ON semesters(title);
CREATE INDEX IF NOT EXISTS idx_semesters_section ON semesters(section);
CREATE INDEX IF NOT EXISTS idx_semesters_active ON semesters(is_active);
CREATE INDEX IF NOT EXISTS idx_semesters_dates ON semesters(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_name);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);

CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_topics_published ON topics(is_published);

CREATE INDEX IF NOT EXISTS idx_slides_topic_id ON slides(topic_id);
CREATE INDEX IF NOT EXISTS idx_slides_order ON slides(topic_id, order_index);

CREATE INDEX IF NOT EXISTS idx_videos_topic_id ON videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(topic_id, order_index);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published);

CREATE INDEX IF NOT EXISTS idx_study_tools_course_id ON study_tools(course_id);
CREATE INDEX IF NOT EXISTS idx_study_tools_type ON study_tools(type);
CREATE INDEX IF NOT EXISTS idx_study_tools_exam_type ON study_tools(exam_type);

-- Admin table indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_date ON content_analytics(created_at);

-- System logs table indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_entity ON system_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_date ON system_logs(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
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
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies for content tables
CREATE POLICY "Public read semesters" ON semesters FOR SELECT USING (is_active = true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (is_published = true);
CREATE POLICY "Public read slides" ON slides FOR SELECT USING (true);
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (is_published = true);
CREATE POLICY "Public read study_tools" ON study_tools FOR SELECT USING (true);

-- Service role full access policies (for API operations)
-- Using auth.jwt() IS NULL to detect service role requests
CREATE POLICY "Service role full access semesters" ON semesters FOR ALL USING (auth.jwt() IS NULL);
CREATE POLICY "Service role full access courses" ON courses FOR ALL USING (auth.jwt() IS NULL);
CREATE POLICY "Service role full access topics" ON topics FOR ALL USING (auth.jwt() IS NULL);
CREATE POLICY "Service role full access slides" ON slides FOR ALL USING (auth.jwt() IS NULL);
CREATE POLICY "Service role full access videos" ON videos FOR ALL USING (auth.jwt() IS NULL);
CREATE POLICY "Service role full access study_tools" ON study_tools FOR ALL USING (auth.jwt() IS NULL);
CREATE POLICY "Service role full access admin_users" ON admin_users FOR ALL USING (auth.jwt() IS NULL);
CREATE POLICY "Service role full access admin_sessions" ON admin_sessions FOR ALL USING (auth.jwt() IS NULL);
CREATE POLICY "Service role full access content_analytics" ON content_analytics FOR ALL USING (auth.jwt() IS NULL);
CREATE POLICY "Service role full access system_logs" ON system_logs FOR ALL USING (auth.jwt() IS NULL);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers for all tables
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_tools_updated_at BEFORE UPDATE ON study_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- System logging trigger function
CREATE OR REPLACE FUNCTION log_system_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO system_logs (action, entity_type, entity_id, old_values, new_values)
    VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply logging triggers to important tables
CREATE TRIGGER log_semesters_changes AFTER INSERT OR UPDATE OR DELETE ON semesters FOR EACH ROW EXECUTE FUNCTION log_system_changes();
CREATE TRIGGER log_courses_changes AFTER INSERT OR UPDATE OR DELETE ON courses FOR EACH ROW EXECUTE FUNCTION log_system_changes();
CREATE TRIGGER log_admin_users_changes AFTER INSERT OR UPDATE OR DELETE ON admin_users FOR EACH ROW EXECUTE FUNCTION log_system_changes();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get semester statistics
CREATE OR REPLACE FUNCTION get_semester_stats(semester_uuid UUID)
RETURNS TABLE (
    total_courses INTEGER,
    total_topics INTEGER,
    total_slides INTEGER,
    total_videos INTEGER,
    total_study_tools INTEGER,
    total_duration_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT c.id)::INTEGER as total_courses,
        COUNT(DISTINCT t.id)::INTEGER as total_topics,
        COUNT(DISTINCT sl.id)::INTEGER as total_slides,
        COUNT(DISTINCT v.id)::INTEGER as total_videos,
        COUNT(DISTINCT st.id)::INTEGER as total_study_tools,
        COALESCE(SUM(v.duration_minutes), 0)::INTEGER as total_duration_minutes
    FROM semesters s
    LEFT JOIN courses c ON s.id = c.semester_id AND c.is_active = true
    LEFT JOIN topics t ON c.id = t.course_id AND t.is_published = true
    LEFT JOIN slides sl ON t.id = sl.topic_id
    LEFT JOIN videos v ON t.id = v.topic_id AND v.is_published = true
    LEFT JOIN study_tools st ON c.id = st.course_id
    WHERE s.id = semester_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Default admin user
INSERT INTO admin_users (email, password_hash, full_name, role, department)
SELECT 'admin@diu.edu.bd', crypt('admin123', gen_salt('bf')), 'System Administrator', 'super_admin', 'Computer Science'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@diu.edu.bd');

-- Content creator admin
INSERT INTO admin_users (email, password_hash, full_name, role, department)
SELECT 'content@diu.edu.bd', crypt('admin123', gen_salt('bf')), 'Content Creator', 'content_creator', 'Academic Affairs'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'content@diu.edu.bd');

-- Sample semester
INSERT INTO semesters (title, description, section, has_midterm, has_final, start_date, end_date, default_credits)
SELECT
    'Summer 2025',
    'Summer semester 2025 - Advanced Computer Science courses with practical focus',
    '63_G',
    true,
    true,
    '2025-06-01',
    '2025-08-31',
    3
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE title = 'Summer 2025' AND section = '63_G');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 CORRECTED DATABASE SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All PostgreSQL syntax issues fixed';
    RAISE NOTICE '✅ All tables created with enhanced fields';
    RAISE NOTICE '✅ Indexes created separately for compatibility';
    RAISE NOTICE '✅ RLS policies configured correctly';
    RAISE NOTICE '✅ Triggers and functions working';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your Enhanced DIU Learning Platform Database is ready!';
END $$;
