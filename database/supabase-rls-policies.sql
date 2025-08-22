-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- DIU Learning Platform - Enhanced All-in-One Creator
-- ============================================================================
-- Version: 1.0
-- Created: 2025-01-22
-- Purpose: Security policies for production deployment
-- ============================================================================

-- ============================================================================
-- OPTION 1: DEVELOPMENT MODE (DISABLE RLS)
-- ============================================================================
-- Use this for development and testing

-- Disable RLS on all tables for development
ALTER TABLE semesters DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    RAISE NOTICE '🔓 RLS DISABLED FOR DEVELOPMENT';
    RAISE NOTICE '⚠️  This configuration is for development only';
    RAISE NOTICE '🔒 Enable RLS policies for production deployment';
END $$;

-- ============================================================================
-- OPTION 2: PRODUCTION MODE (ENABLE RLS WITH POLICIES)
-- ============================================================================
-- Uncomment this section for production deployment

/*
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

-- ============================================================================
-- SEMESTERS POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access semesters" ON semesters
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read semesters
CREATE POLICY "Authenticated users can read semesters" ON semesters
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin users full access (if using custom auth)
CREATE POLICY "Admin users full access semesters" ON semesters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- COURSES POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access courses" ON courses
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read courses
CREATE POLICY "Authenticated users can read courses" ON courses
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin users full access
CREATE POLICY "Admin users full access courses" ON courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- TOPICS POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access topics" ON topics
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read topics
CREATE POLICY "Authenticated users can read topics" ON topics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin users full access
CREATE POLICY "Admin users full access topics" ON topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- SLIDES POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access slides" ON slides
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read slides
CREATE POLICY "Authenticated users can read slides" ON slides
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin users full access
CREATE POLICY "Admin users full access slides" ON slides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- VIDEOS POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access videos" ON videos
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read videos
CREATE POLICY "Authenticated users can read videos" ON videos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin users full access
CREATE POLICY "Admin users full access videos" ON videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- STUDY TOOLS POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access study_tools" ON study_tools
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read study tools
CREATE POLICY "Authenticated users can read study_tools" ON study_tools
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin users full access
CREATE POLICY "Admin users full access study_tools" ON study_tools
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- ADMIN USERS POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access admin_users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');

-- Allow admin users to read other admin users
CREATE POLICY "Admin users can read admin_users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow admin users to update their own profile
CREATE POLICY "Admin users can update own profile" ON admin_users
    FOR UPDATE USING (id = auth.uid());

-- ============================================================================
-- ADMIN SESSIONS POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access admin_sessions" ON admin_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Allow admin users to manage their own sessions
CREATE POLICY "Admin users can manage own sessions" ON admin_sessions
    FOR ALL USING (admin_user_id = auth.uid());

-- ============================================================================
-- CONTENT ANALYTICS POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access content_analytics" ON content_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Allow insert for tracking (anonymous users can log analytics)
CREATE POLICY "Allow analytics tracking" ON content_analytics
    FOR INSERT WITH CHECK (true);

-- Allow admin users to read analytics
CREATE POLICY "Admin users can read analytics" ON content_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- SYSTEM LOGS POLICIES
-- ============================================================================

-- Allow service role full access
CREATE POLICY "Service role full access system_logs" ON system_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Allow admin users to read system logs
CREATE POLICY "Admin users can read system_logs" ON system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Allow system to insert logs
CREATE POLICY "Allow system log insertion" ON system_logs
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 RLS POLICIES CREATED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️  Security Features:';
    RAISE NOTICE '   • Service role has full access';
    RAISE NOTICE '   • Authenticated users can read content';
    RAISE NOTICE '   • Admin users have full management access';
    RAISE NOTICE '   • Analytics tracking enabled';
    RAISE NOTICE '   • System logging enabled';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Remember to:';
    RAISE NOTICE '   • Configure Supabase service role key';
    RAISE NOTICE '   • Set up admin authentication';
    RAISE NOTICE '   • Test policies before production';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Production-ready security enabled!';
    RAISE NOTICE '';
END $$;

*/
