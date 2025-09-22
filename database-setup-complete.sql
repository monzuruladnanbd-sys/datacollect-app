-- Complete Database Setup for WB-S DataCollect Application
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with enhanced fields
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('submitter', 'reviewer', 'approver', 'admin')) NOT NULL DEFAULT 'submitter',
    full_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
    id VARCHAR(50) NOT NULL,
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
    
    PRIMARY KEY (id, saved_at),
    FOREIGN KEY (user_email) REFERENCES users(email) ON UPDATE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_user_email ON submissions(user_email);
CREATE INDEX idx_submissions_saved_at ON submissions(saved_at DESC);
CREATE INDEX idx_submissions_period ON submissions(period);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (email = auth.jwt() ->> 'email');
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users admin_user 
        WHERE admin_user.email = auth.jwt() ->> 'email' 
        AND admin_user.role = 'admin' AND admin_user.is_active = true
    )
);

-- Submissions RLS Policies
CREATE POLICY "Users can view submissions based on role" ON submissions FOR SELECT USING (
    (user_email = auth.jwt() ->> 'email') OR
    (status IN ('submitted', 'reviewed', 'approved', 'rejected', 'deleted') AND EXISTS (
        SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
        AND role IN ('reviewer', 'approver', 'admin') AND is_active = true
    )) OR
    (status IN ('reviewed', 'approved', 'rejected', 'deleted') AND EXISTS (
        SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
        AND role IN ('approver', 'admin') AND is_active = true
    )) OR
    EXISTS (
        SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
        AND role = 'admin' AND is_active = true
    )
);

CREATE POLICY "Submitters can create submissions" ON submissions FOR INSERT WITH CHECK (
    user_email = auth.jwt() ->> 'email' AND
    EXISTS (
        SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
        AND role IN ('submitter', 'admin') AND is_active = true
    )
);

CREATE POLICY "Users can update submissions based on role" ON submissions FOR UPDATE USING (
    (user_email = auth.jwt() ->> 'email' AND status = 'draft') OR
    (status = 'submitted' AND EXISTS (
        SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
        AND role IN ('reviewer', 'admin') AND is_active = true
    )) OR
    (status = 'reviewed' AND EXISTS (
        SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
        AND role IN ('approver', 'admin') AND is_active = true
    )) OR
    EXISTS (
        SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' 
        AND role = 'admin' AND is_active = true
    )
);

-- Insert default admin user
INSERT INTO users (email, password_hash, role, full_name, is_active, email_verified) VALUES
    ('admin@datacollect.app', crypt('admin123', gen_salt('bf')), 'admin', 'System Administrator', true, true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;

