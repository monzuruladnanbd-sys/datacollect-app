-- Fix user email mismatches in the database
-- Update existing submissions to use the correct user emails

-- Update submissions to use the correct user emails
UPDATE submissions 
SET user_email = 'submitter@datacollect.app' 
WHERE user_email = 'submitter@submit.com';

-- Verify the changes
SELECT id, user_email, status FROM submissions ORDER BY saved_at DESC;
