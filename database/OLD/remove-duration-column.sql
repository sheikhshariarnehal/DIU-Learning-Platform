-- Remove duration column from videos table
-- This script safely removes the duration column if it exists

DO $$
BEGIN
    -- Check if duration column exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'videos' 
        AND column_name = 'duration'
    ) THEN
        ALTER TABLE videos DROP COLUMN duration;
        RAISE NOTICE '✅ Dropped duration column from videos table';
    ELSE
        RAISE NOTICE 'ℹ️  duration column not found in videos table';
    END IF;
    
    -- Check if duration_minutes column exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'videos' 
        AND column_name = 'duration_minutes'
    ) THEN
        ALTER TABLE videos DROP COLUMN duration_minutes;
        RAISE NOTICE '✅ Dropped duration_minutes column from videos table';
    ELSE
        RAISE NOTICE 'ℹ️  duration_minutes column not found in videos table';
    END IF;
    
    -- Also remove any constraints that might reference duration
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'positive_duration' 
        AND table_name = 'videos'
    ) THEN
        ALTER TABLE videos DROP CONSTRAINT positive_duration;
        RAISE NOTICE '✅ Dropped positive_duration constraint';
    ELSE
        RAISE NOTICE 'ℹ️  positive_duration constraint not found';
    END IF;
    
    -- Remove any views that might reference duration
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'course_details'
    ) THEN
        -- Drop and recreate course_details view without duration
        DROP VIEW IF EXISTS course_details;
        RAISE NOTICE '✅ Dropped course_details view (will be recreated without duration)';
        
        -- Recreate the view without duration references
        CREATE OR REPLACE VIEW course_details AS
        SELECT
            c.id,
            c.title,
            c.course_code,
            c.teacher_name,
            c.teacher_email,
            c.description,
            c.credits,
            c.semester_id,
            c.is_active,
            c.created_at,
            c.updated_at,
            s.title as semester_title,
            s.section as semester_section,
            COUNT(DISTINCT t.id) as topics_count,
            COUNT(DISTINCT sl.id) as slides_count,
            COUNT(DISTINCT v.id) as videos_count,
            COUNT(DISTINCT st.id) as study_tools_count
        FROM courses c
        LEFT JOIN semesters s ON c.semester_id = s.id
        LEFT JOIN topics t ON c.id = t.course_id
        LEFT JOIN slides sl ON t.id = sl.topic_id
        LEFT JOIN videos v ON t.id = v.topic_id
        LEFT JOIN study_tools st ON c.id = st.course_id
        GROUP BY c.id, s.title, s.section;
        
        RAISE NOTICE '✅ Recreated course_details view without duration references';
    END IF;
    
END $$;

-- Verify the changes
DO $$
BEGIN
    RAISE NOTICE '🔍 Verification:';
    
    -- Check videos table structure
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'videos' 
        AND column_name IN ('duration', 'duration_minutes')
    ) THEN
        RAISE NOTICE '✅ Videos table no longer has duration columns';
    ELSE
        RAISE NOTICE '⚠️  Some duration columns may still exist';
    END IF;
    
    -- List current videos table columns
    RAISE NOTICE 'ℹ️  Current videos table columns:';
    FOR rec IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'videos' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '   • %: %', rec.column_name, rec.data_type;
    END LOOP;
    
END $$;
