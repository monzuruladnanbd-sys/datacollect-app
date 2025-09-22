-- Check what users exist in the database
SELECT id, email, role, full_name, is_active, created_at 
FROM users 
ORDER BY created_at;

-- If the other users are missing, run these INSERT statements:
-- (Only run if the SELECT above shows missing users)

INSERT INTO users (email, role, full_name, is_active, status, created_at, updated_at)
VALUES 
  ('submitter@datacollect.app', 'submitter', 'Submitter User', true, 'approved', NOW(), NOW()),
  ('reviewer@datacollect.app', 'reviewer', 'Reviewer User', true, 'approved', NOW(), NOW()),
  ('approver@datacollect.app', 'approver', 'Approver User', true, 'approved', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status,
  updated_at = NOW();
