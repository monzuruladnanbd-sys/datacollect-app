-- 🚀 COPY AND PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR

-- Create users table
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'submitter',
  department text,
  phone text,
  is_active boolean DEFAULT true,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create submissions table
CREATE TABLE submissions (
  id text PRIMARY KEY,
  section text NOT NULL,
  level text NOT NULL,
  label text NOT NULL,
  value text,
  unit text,
  frequency text,
  period text,
  year text,
  quarter text,
  responsible text,
  disaggregation text,
  notes text,
  status text DEFAULT 'draft',
  user_email text,
  submitter_message text,
  reviewer_message text,
  approver_message text,
  saved_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for now)
CREATE POLICY "Enable all operations for users" ON users 
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for submissions" ON submissions 
  FOR ALL USING (true) WITH CHECK (true);

-- Insert demo users
INSERT INTO users (email, full_name, role, is_active) VALUES
('admin@datacollect.app', 'System Administrator', 'admin', true),
('data@example.com', 'Data Submitter', 'submitter', true),
('review@example.com', 'Senior Data Reviewer', 'reviewer', true),
('approve@example.com', 'Project Manager', 'approver', true);

-- ✅ If this runs without errors, your database is ready!
