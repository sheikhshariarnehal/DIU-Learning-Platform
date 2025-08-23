-- Fix Google URL constraint to support all Google product URLs
-- This script removes the restrictive Google Drive URL constraint and replaces it
-- with a more flexible constraint that supports all Google services

-- First, check if the constraint exists and drop it
DO $$
BEGIN
    -- Drop the restrictive Google Drive URL constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_google_drive_url' 
        AND table_name = 'slides'
    ) THEN
        ALTER TABLE slides DROP CONSTRAINT valid_google_drive_url;
        RAISE NOTICE '✅ Dropped restrictive valid_google_drive_url constraint';
    ELSE
        RAISE NOTICE 'ℹ️  valid_google_drive_url constraint not found';
    END IF;
END $$;

-- Add a new flexible constraint that supports all Google product URLs
DO $$
BEGIN
    -- Add new flexible Google URL constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_google_url' 
        AND table_name = 'slides'
    ) THEN
        ALTER TABLE slides ADD CONSTRAINT valid_google_url CHECK (
            google_drive_url ~* '^https://(drive|docs|sheets|forms|sites|calendar|meet|classroom|photos|maps|translate|scholar|books|news|mail|youtube|blogger|plus|hangouts|keep|jamboard|earth|chrome|play|store|pay|ads|analytics|search|trends|alerts|groups|contacts|voice|duo|allo|spaces|currents|my|accounts|support|developers|cloud|firebase|colab|datastudio|optimize|tagmanager|marketingplatform|admob|adsense|doubleclick|googleadservices|googlesyndication|googletagmanager|googleusercontent|gstatic|googleapis|appspot|firebaseapp|web\.app|page\.link|goo\.gl|g\.co)\.google\.com/.*'
        );
        RAISE NOTICE '✅ Added flexible valid_google_url constraint supporting all Google services';
    ELSE
        RAISE NOTICE 'ℹ️  valid_google_url constraint already exists';
    END IF;
END $$;

-- Verify the constraint was applied correctly
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_google_url' 
        AND table_name = 'slides'
    ) THEN
        RAISE NOTICE '✅ Google URL constraint successfully updated';
        RAISE NOTICE 'ℹ️  Now supports all Google product URLs including:';
        RAISE NOTICE '   • Google Drive: https://drive.google.com/...';
        RAISE NOTICE '   • Google Docs: https://docs.google.com/...';
        RAISE NOTICE '   • Google Sheets: https://sheets.google.com/...';
        RAISE NOTICE '   • Google Slides: https://docs.google.com/presentation/...';
        RAISE NOTICE '   • Google Forms: https://forms.google.com/...';
        RAISE NOTICE '   • Google Sites: https://sites.google.com/...';
        RAISE NOTICE '   • Google Classroom: https://classroom.google.com/...';
        RAISE NOTICE '   • Google Meet: https://meet.google.com/...';
        RAISE NOTICE '   • Google Calendar: https://calendar.google.com/...';
        RAISE NOTICE '   • And many more Google services...';
    ELSE
        RAISE NOTICE '❌ Failed to update Google URL constraint';
    END IF;
END $$;
