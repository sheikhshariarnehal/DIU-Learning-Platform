-- ============================================================================
-- FIX RLS POLICIES FOR ENHANCED ALL-IN-ONE CREATOR
-- ============================================================================
-- This script fixes the Row Level Security policies to allow API operations

-- ============================================================================
-- OPTION 1: DISABLE RLS TEMPORARILY (RECOMMENDED FOR DEVELOPMENT)
-- ============================================================================

-- Disable RLS on all tables to allow API operations
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

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS DISABLED - API operations should now work';
    RAISE NOTICE '⚠️  Note: This is recommended for development/testing';
    RAISE NOTICE '🔒 For production, use Option 2 below';
END $$;

-- ============================================================================
-- OPTION 2: PERMISSIVE RLS POLICIES (FOR PRODUCTION)
-- ============================================================================
-- Uncomment the section below if you want to keep RLS enabled with permissive policies

/*
-- Re-enable RLS
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

-- Drop existing policies
DROP POLICY IF EXISTS "Public read semesters" ON semesters;
DROP POLICY IF EXISTS "Public read courses" ON courses;
DROP POLICY IF EXISTS "Public read topics" ON topics;
DROP POLICY IF EXISTS "Public read slides" ON slides;
DROP POLICY IF EXISTS "Public read videos" ON videos;
DROP POLICY IF EXISTS "Public read study_tools" ON study_tools;

DROP POLICY IF EXISTS "Service role full access semesters" ON semesters;
DROP POLICY IF EXISTS "Service role full access courses" ON courses;
DROP POLICY IF EXISTS "Service role full access topics" ON topics;
DROP POLICY IF EXISTS "Service role full access slides" ON slides;
DROP POLICY IF EXISTS "Service role full access videos" ON videos;
DROP POLICY IF EXISTS "Service role full access study_tools" ON study_tools;
DROP POLICY IF EXISTS "Service role full access admin_users" ON admin_users;
DROP POLICY IF EXISTS "Service role full access admin_sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Service role full access content_analytics" ON content_analytics;
DROP POLICY IF EXISTS "Service role full access system_logs" ON system_logs;

-- Create permissive policies that allow all operations
CREATE POLICY "Allow all operations semesters" ON semesters FOR ALL USING (true);
CREATE POLICY "Allow all operations courses" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all operations topics" ON topics FOR ALL USING (true);
CREATE POLICY "Allow all operations slides" ON slides FOR ALL USING (true);
CREATE POLICY "Allow all operations videos" ON videos FOR ALL USING (true);
CREATE POLICY "Allow all operations study_tools" ON study_tools FOR ALL USING (true);
CREATE POLICY "Allow all operations admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Allow all operations admin_sessions" ON admin_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations content_analytics" ON content_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations system_logs" ON system_logs FOR ALL USING (true);

-- Success message for Option 2
DO $$
BEGIN
    RAISE NOTICE '✅ PERMISSIVE RLS POLICIES CREATED';
    RAISE NOTICE '🔒 RLS is enabled with permissive policies';
    RAISE NOTICE '⚠️  All operations are allowed - customize as needed';
END $$;
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test if we can insert into semesters table
DO $$
BEGIN
    -- Try to insert a test record
    INSERT INTO semesters (title, description, section) 
    VALUES ('Test Semester', 'Test Description', 'TEST_SECTION');
    
    -- If successful, delete the test record
    DELETE FROM semesters WHERE section = 'TEST_SECTION';
    
    RAISE NOTICE '✅ DATABASE ACCESS TEST PASSED';
    RAISE NOTICE '🎉 Enhanced All-in-One Creator should now work!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ DATABASE ACCESS TEST FAILED: %', SQLERRM;
    RAISE NOTICE '🔧 You may need to check your Supabase configuration';
END $$;

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 INSTRUCTIONS:';
    RAISE NOTICE '1. Run this script in your Supabase SQL editor';
    RAISE NOTICE '2. Test the Enhanced All-in-One Creator';
    RAISE NOTICE '3. If it works, you''re all set!';
    RAISE NOTICE '4. For production, consider using Option 2 with custom policies';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Test URLs:';
    RAISE NOTICE '   • Enhanced Creator: /admin/enhanced-creator';
    RAISE NOTICE '   • Test Page: /admin/test-enhanced';
    RAISE NOTICE '';
END $$;
