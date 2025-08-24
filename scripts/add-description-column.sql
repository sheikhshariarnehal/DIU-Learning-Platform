-- Migration to add description column to study_tools table
-- This script ensures the description column exists for syllabus functionality

DO $$
BEGIN
    -- Add description column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='study_tools' AND column_name='description') THEN
        ALTER TABLE study_tools ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to study_tools table';
    ELSE
        RAISE NOTICE 'Description column already exists in study_tools table';
    END IF;

    -- Update content_url constraint to allow NULL values
    BEGIN
        ALTER TABLE study_tools DROP CONSTRAINT IF EXISTS valid_content_url;
        ALTER TABLE study_tools ADD CONSTRAINT valid_content_url CHECK (content_url IS NULL OR content_url ~* '^https?://.*');
        RAISE NOTICE 'Updated content_url constraint to allow NULL values';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Content URL constraint update failed or already exists: %', SQLERRM;
    END;

END $$;
