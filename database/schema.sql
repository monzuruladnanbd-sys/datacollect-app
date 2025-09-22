-- DataCollect Application Database Schema
-- Copyright-free, open-source database structure
-- Compatible with PostgreSQL (Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('submitter', 'reviewer', 'approver', 'admin')) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
    id VARCHAR(50) NOT NULL, -- Indicator ID like "FM-P-001"
    section VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    unit VARCHAR(50),
    frequency VARCHAR(50),
    period VARCHAR(50),
    year VARCHAR(4),
    quarter VARCHAR(10),
    responsible TEXT,
    disaggregation TEXT,
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected', 'deleted')) DEFAULT 'draft',
    saved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    submitter_message TEXT DEFAULT '',
    reviewer_message TEXT DEFAULT '',
    approver_message TEXT DEFAULT '',
    user_email VARCHAR(255) NOT NULL,
    reviewed_by VARCHAR(255),
    approved_by VARCHAR(255),
    deleted_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite primary key to allow multiple submissions for same indicator
    PRIMARY KEY (id, saved_at),
    
    -- Foreign key to users table
    FOREIGN KEY (user_email) REFERENCES users(email) ON UPDATE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_user_email ON submissions(user_email);
CREATE INDEX idx_submissions_saved_at ON submissions(saved_at DESC);
CREATE INDEX idx_submissions_period ON submissions(period);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users admin_user 
            WHERE admin_user.email = auth.jwt() ->> 'email' 
            AND admin_user.role = 'admin'
            AND admin_user.is_active = true
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (email = auth.jwt() ->> 'email');

-- Submissions RLS Policies
CREATE POLICY "Users can view submissions based on role" ON submissions
    FOR SELECT USING (
        -- Submitters can see their own submissions
        (user_email = auth.jwt() ->> 'email') OR
        -- Reviewers can see submitted and reviewed items
        (status IN ('submitted', 'reviewed', 'approved', 'rejected', 'deleted') AND EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('reviewer', 'approver', 'admin') AND is_active = true
        )) OR
        -- Approvers can see reviewed items and above
        (status IN ('reviewed', 'approved', 'rejected', 'deleted') AND EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('approver', 'admin') AND is_active = true
        )) OR
        -- Admins can see everything
        EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin' AND is_active = true
        )
    );

CREATE POLICY "Submitters can create submissions" ON submissions
    FOR INSERT WITH CHECK (
        user_email = auth.jwt() ->> 'email' AND
        EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('submitter', 'admin') AND is_active = true
        )
    );

CREATE POLICY "Users can update submissions based on role" ON submissions
    FOR UPDATE USING (
        -- Submitters can update their own drafts
        (user_email = auth.jwt() ->> 'email' AND status = 'draft') OR
        -- Reviewers can update submitted items (edit before review)
        (status = 'submitted' AND EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('reviewer', 'admin') AND is_active = true
        )) OR
        -- Approvers can update reviewed items (edit before approve)
        (status = 'reviewed' AND EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('approver', 'admin') AND is_active = true
        )) OR
        -- Admins can update anything
        EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin' AND is_active = true
        )
    );

CREATE POLICY "Users can delete submissions based on role" ON submissions
    FOR DELETE USING (
        -- Submitters can delete their own drafts
        (user_email = auth.jwt() ->> 'email' AND status = 'draft') OR
        -- Reviewers can delete submitted items (before review)
        (status = 'submitted' AND EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('reviewer', 'admin') AND is_active = true
        )) OR
        -- Approvers can delete reviewed items (before approval)
        (status = 'reviewed' AND EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('approver', 'admin') AND is_active = true
        )) OR
        -- Admins can delete anything
        EXISTS (
            SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin' AND is_active = true
        )
    );

-- Insert default admin user
INSERT INTO users (email, role, full_name, status) VALUES
    ('admin@datacollect.app', 'admin', 'System Administrator', 'approved');

-- Insert sample users for testing
INSERT INTO users (email, role, full_name, status) VALUES
    ('submitter@datacollect.app', 'submitter', 'Sample Submitter', 'approved'),
    ('reviewer@datacollect.app', 'reviewer', 'Sample Reviewer', 'approved'),
    ('approver@datacollect.app', 'approver', 'Sample Approver', 'approved');

-- Create sample submission data
INSERT INTO submissions (
    id, section, level, label, value, unit, frequency, period, year, quarter,
    responsible, disaggregation, notes, status, saved_at, user_email
) VALUES
    ('FM-P-001', 'Fisheries Management', 'Project', 
     'At-sea patrol missions / vessel inspections', '5', 'missions', 
     'Quarterly', '2024 Q1', '2024', 'Q1',
     'Compliance Unit, PMU M&E Specialist', 'EEZ, Territorial waters',
     'Sample data for testing', 'draft', NOW(), 'submitter@datacollect.app');

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;



