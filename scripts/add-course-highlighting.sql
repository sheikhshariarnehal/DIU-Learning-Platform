-- Migration to add course highlighting feature
-- This script adds the is_highlighted column to courses table for admin course highlighting functionality

DO $$
BEGIN
    -- Add is_highlighted column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='courses' AND column_name='is_highlighted') THEN
        ALTER TABLE courses ADD COLUMN is_highlighted BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_highlighted column to courses table';
    ELSE
        RAISE NOTICE 'is_highlighted column already exists in courses table';
    END IF;

    -- Add comment for documentation
    BEGIN
        COMMENT ON COLUMN courses.is_highlighted IS 'Indicates if the course should be highlighted/featured in the user interface';
        RAISE NOTICE 'Added comment to is_highlighted column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Comment addition failed: %', SQLERRM;
    END;

    -- Create index for better query performance when filtering highlighted courses
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_courses_is_highlighted ON courses(is_highlighted) WHERE is_highlighted = true;
        RAISE NOTICE 'Created index for highlighted courses';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Index creation failed: %', SQLERRM;
    END;

    -- Update any existing courses to have default highlighting status
    UPDATE courses SET is_highlighted = false WHERE is_highlighted IS NULL;
    RAISE NOTICE 'Updated existing courses with default highlighting status';

END $$;
