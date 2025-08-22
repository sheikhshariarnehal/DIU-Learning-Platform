-- Fix missing description column in semesters table
-- This script ensures the description column exists in the semesters table

-- Check if the semesters table exists and add description column if missing
DO $$ 
BEGIN 
    -- Check if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'semesters') THEN
        -- Check if description column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='semesters' AND column_name='description') THEN
            -- Add the description column
            ALTER TABLE semesters ADD COLUMN description TEXT;
            RAISE NOTICE 'Added description column to semesters table';
        ELSE
            RAISE NOTICE 'Description column already exists in semesters table';
        END IF;
    ELSE
        RAISE NOTICE 'Semesters table does not exist. Please run 01-create-tables.sql first';
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'semesters' 
ORDER BY ordinal_position;
