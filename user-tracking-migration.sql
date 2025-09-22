-- User Tracking Migration Script
-- Add missing user tracking columns to submissions table

-- Add new user tracking columns
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS submitted_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS restored_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS edited_by VARCHAR(255);

-- Add new timestamp columns
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_by ON submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_submissions_rejected_by ON submissions(rejected_by);
CREATE INDEX IF NOT EXISTS idx_submissions_restored_by ON submissions(restored_by);
CREATE INDEX IF NOT EXISTS idx_submissions_edited_by ON submissions(edited_by);

-- Update existing records to populate submitted_by with user_email for submitted records
UPDATE submissions 
SET submitted_by = user_email 
WHERE status IN ('submitted', 'reviewed', 'approved', 'rejected', 'deleted') 
AND submitted_by IS NULL;

-- Update existing records to populate submitted_at with saved_at for submitted records
UPDATE submissions 
SET submitted_at = saved_at 
WHERE status IN ('submitted', 'reviewed', 'approved', 'rejected', 'deleted') 
AND submitted_at IS NULL;

-- Add foreign key constraints for user tracking
ALTER TABLE submissions 
ADD CONSTRAINT fk_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(email) ON UPDATE CASCADE,
ADD CONSTRAINT fk_rejected_by FOREIGN KEY (rejected_by) REFERENCES users(email) ON UPDATE CASCADE,
ADD CONSTRAINT fk_restored_by FOREIGN KEY (restored_by) REFERENCES users(email) ON UPDATE CASCADE,
ADD CONSTRAINT fk_edited_by FOREIGN KEY (edited_by) REFERENCES users(email) ON UPDATE CASCADE;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'submissions' 
AND column_name IN (
    'submitted_by', 'rejected_by', 'restored_by', 'edited_by',
    'submitted_at', 'rejected_at', 'restored_at', 'edited_at'
)
ORDER BY column_name;
