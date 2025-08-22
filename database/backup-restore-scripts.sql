-- ============================================================================
-- BACKUP AND RESTORE SCRIPTS
-- DIU Learning Platform - Enhanced All-in-One Creator
-- ============================================================================
-- Version: 1.0
-- Created: 2025-01-22
-- Purpose: Database backup and restore utilities
-- ============================================================================

-- ============================================================================
-- BACKUP SCRIPT
-- ============================================================================

-- Create backup schema
CREATE SCHEMA IF NOT EXISTS backup_$(date +%Y%m%d_%H%M%S);

-- Function to create full backup
CREATE OR REPLACE FUNCTION create_full_backup(backup_schema_name TEXT)
RETURNS TEXT AS $$
DECLARE
    table_name TEXT;
    backup_count INTEGER := 0;
BEGIN
    -- Create backup schema if not exists
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', backup_schema_name);
    
    -- Backup all main tables
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('semesters', 'courses', 'topics', 'slides', 'videos', 'study_tools', 'admin_users', 'admin_sessions', 'content_analytics', 'system_logs')
    LOOP
        EXECUTE format('CREATE TABLE %I.%I AS SELECT * FROM public.%I', 
                      backup_schema_name, table_name, table_name);
        backup_count := backup_count + 1;
    END LOOP;
    
    RETURN format('Backup completed: %s tables backed up to schema %s', backup_count, backup_schema_name);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RESTORE SCRIPT
-- ============================================================================

-- Function to restore from backup
CREATE OR REPLACE FUNCTION restore_from_backup(backup_schema_name TEXT)
RETURNS TEXT AS $$
DECLARE
    table_name TEXT;
    restore_count INTEGER := 0;
BEGIN
    -- Check if backup schema exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = backup_schema_name) THEN
        RETURN format('Backup schema %s does not exist', backup_schema_name);
    END IF;
    
    -- Disable triggers temporarily
    SET session_replication_role = replica;
    
    -- Restore all tables
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = backup_schema_name
        AND tablename IN ('semesters', 'courses', 'topics', 'slides', 'videos', 'study_tools', 'admin_users', 'admin_sessions', 'content_analytics', 'system_logs')
    LOOP
        -- Truncate existing table
        EXECUTE format('TRUNCATE TABLE public.%I CASCADE', table_name);
        
        -- Insert backup data
        EXECUTE format('INSERT INTO public.%I SELECT * FROM %I.%I', 
                      table_name, backup_schema_name, table_name);
        restore_count := restore_count + 1;
    END LOOP;
    
    -- Re-enable triggers
    SET session_replication_role = DEFAULT;
    
    RETURN format('Restore completed: %s tables restored from schema %s', restore_count, backup_schema_name);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATA EXPORT FUNCTIONS
-- ============================================================================

-- Export semesters with all related data
CREATE OR REPLACE FUNCTION export_semester_data(semester_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'semester', (
            SELECT row_to_json(s) FROM (
                SELECT * FROM semesters WHERE id = semester_id
            ) s
        ),
        'courses', (
            SELECT json_agg(
                json_build_object(
                    'course', course_data,
                    'topics', topics_data,
                    'study_tools', study_tools_data
                )
            )
            FROM (
                SELECT 
                    row_to_json(c) as course_data,
                    (
                        SELECT json_agg(
                            json_build_object(
                                'topic', topic_data,
                                'slides', slides_data,
                                'videos', videos_data
                            )
                        )
                        FROM (
                            SELECT 
                                row_to_json(t) as topic_data,
                                (SELECT json_agg(row_to_json(sl)) FROM slides sl WHERE sl.topic_id = t.id) as slides_data,
                                (SELECT json_agg(row_to_json(v)) FROM videos v WHERE v.topic_id = t.id) as videos_data
                            FROM topics t WHERE t.course_id = c.id
                            ORDER BY t.order_index
                        ) topic_subquery
                    ) as topics_data,
                    (SELECT json_agg(row_to_json(st)) FROM study_tools st WHERE st.course_id = c.id) as study_tools_data
                FROM courses c WHERE c.semester_id = export_semester_data.semester_id
            ) course_subquery
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Clean old backups (keep last 5)
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS TEXT AS $$
DECLARE
    schema_name TEXT;
    cleanup_count INTEGER := 0;
BEGIN
    FOR schema_name IN 
        SELECT schema_name FROM information_schema.schemata 
        WHERE schema_name LIKE 'backup_%'
        ORDER BY schema_name DESC
        OFFSET 5
    LOOP
        EXECUTE format('DROP SCHEMA %I CASCADE', schema_name);
        cleanup_count := cleanup_count + 1;
    END LOOP;
    
    RETURN format('Cleanup completed: %s old backup schemas removed', cleanup_count);
END;
$$ LANGUAGE plpgsql;

-- Clean old analytics data (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS TEXT AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM content_analytics 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN format('Analytics cleanup completed: %s old records removed', deleted_count);
END;
$$ LANGUAGE plpgsql;

-- Clean old system logs (older than 6 months)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS TEXT AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM system_logs 
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN format('Logs cleanup completed: %s old records removed', deleted_count);
END;
$$ LANGUAGE plpgsql;

-- Clean expired admin sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TEXT AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM admin_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN format('Sessions cleanup completed: %s expired sessions removed', deleted_count);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================================

-- Update table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS TEXT AS $$
BEGIN
    ANALYZE semesters;
    ANALYZE courses;
    ANALYZE topics;
    ANALYZE slides;
    ANALYZE videos;
    ANALYZE study_tools;
    ANALYZE admin_users;
    ANALYZE admin_sessions;
    ANALYZE content_analytics;
    ANALYZE system_logs;
    
    RETURN 'Table statistics updated successfully';
END;
$$ LANGUAGE plpgsql;

-- Vacuum tables
CREATE OR REPLACE FUNCTION vacuum_tables()
RETURNS TEXT AS $$
BEGIN
    VACUUM ANALYZE semesters;
    VACUUM ANALYZE courses;
    VACUUM ANALYZE topics;
    VACUUM ANALYZE slides;
    VACUUM ANALYZE videos;
    VACUUM ANALYZE study_tools;
    VACUUM ANALYZE admin_users;
    VACUUM ANALYZE admin_sessions;
    VACUUM ANALYZE content_analytics;
    VACUUM ANALYZE system_logs;
    
    RETURN 'Table vacuum completed successfully';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Example: Create backup
-- SELECT create_full_backup('backup_20250122_120000');

-- Example: Restore from backup
-- SELECT restore_from_backup('backup_20250122_120000');

-- Example: Export specific semester
-- SELECT export_semester_data('your-semester-uuid-here');

-- Example: Cleanup old data
-- SELECT cleanup_old_backups();
-- SELECT cleanup_old_analytics();
-- SELECT cleanup_old_logs();
-- SELECT cleanup_expired_sessions();

-- Example: Maintenance
-- SELECT update_table_statistics();
-- SELECT vacuum_tables();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 BACKUP & RESTORE FUNCTIONS CREATED!';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Available Functions:';
    RAISE NOTICE '   • create_full_backup(schema_name)';
    RAISE NOTICE '   • restore_from_backup(schema_name)';
    RAISE NOTICE '   • export_semester_data(semester_id)';
    RAISE NOTICE '   • cleanup_old_backups()';
    RAISE NOTICE '   • cleanup_old_analytics()';
    RAISE NOTICE '   • cleanup_old_logs()';
    RAISE NOTICE '   • cleanup_expired_sessions()';
    RAISE NOTICE '   • update_table_statistics()';
    RAISE NOTICE '   • vacuum_tables()';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Usage Examples:';
    RAISE NOTICE '   SELECT create_full_backup(''backup_'' || to_char(now(), ''YYYYMMDD_HH24MISS''));';
    RAISE NOTICE '   SELECT cleanup_old_backups();';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Database utilities ready!';
    RAISE NOTICE '';
END $$;
