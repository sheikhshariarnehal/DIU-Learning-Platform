-- Add description column to topics table
ALTER TABLE topics ADD COLUMN description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN topics.description IS 'Optional description for the topic';
