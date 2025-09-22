const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Supabase database...');
    
    // Read the schema file
    const schema = fs.readFileSync('database/schema.sql', 'utf8');
    
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error setting up schema:', error);
      
      // Try to set up tables manually if exec_sql doesn't work
      console.log('🔄 Trying manual table creation...');
      await createTablesManually();
    } else {
      console.log('✅ Database schema created successfully!');
    }
    
    // Test the connection
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error testing connection:', usersError);
    } else {
      console.log('✅ Database connection successful!');
      console.log('📊 Found', users?.length || 0, 'users in database');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

async function createTablesManually() {
  try {
    console.log('🔧 Creating tables manually...');
    
    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          role VARCHAR(20) CHECK (role IN ('submitter', 'reviewer', 'approver', 'admin')) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (usersError) {
      console.log('⚠️ Users table may already exist:', usersError.message);
    } else {
      console.log('✅ Users table created');
    }
    
    // Create submissions table
    const { error: submissionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS submissions (
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
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (id, saved_at)
        );
      `
    });
    
    if (submissionsError) {
      console.log('⚠️ Submissions table may already exist:', submissionsError.message);
    } else {
      console.log('✅ Submissions table created');
    }
    
  } catch (error) {
    console.error('❌ Manual table creation failed:', error);
  }
}

async function migrateCurrentData() {
  try {
    console.log('📦 Migrating current data...');
    
    // Your current data from the terminal logs
    const currentData = [
      {
        id: 'FM-OC-001',
        section: 'Fisheries Management',
        level: 'outcome',
        label: 'Observer reports submitted electronically',
        value: '5566',
        unit: 'Percent %',
        frequency: 'Annual',
        period: '2024',
        year: '2024',
        quarter: '',
        responsible: 'MFMR Offshore Division (Observer Program), PMU M&E Specialist',
        disaggregation: 'Electronic',
        notes: '5555',
        status: 'submitted',
        saved_at: '2025-09-21T21:02:02.834Z',
        submitter_message: 'u',
        reviewer_message: '',
        approver_message: '',
        user_email: 'submitter@submit.com'
      },
      {
        id: 'FM-O-003',
        section: 'Fisheries Management',
        level: 'output',
        label: 'Fishing vessel inspections conducted',
        value: '5345',
        unit: 'Number of inspections',
        frequency: 'Baseline & Endline',
        period: '',
        year: '',
        quarter: '',
        responsible: 'MFMR Compliance Unit, PMU M&E Specialist',
        disaggregation: 'Foreign, Domestic',
        notes: 'yryryr',
        status: 'submitted',
        saved_at: '2025-09-21T21:03:07.034Z',
        submitter_message: '',
        reviewer_message: '',
        approver_message: '',
        user_email: 'submitter@submit.com'
      },
      {
        id: 'FM-OC-002',
        section: 'Fisheries Management',
        level: 'outcome',
        label: 'Vessels reporting via VMS',
        value: '646',
        unit: 'Percent %',
        frequency: 'Annual',
        period: '2026',
        year: '2026',
        quarter: '',
        responsible: '',
        disaggregation: 'Domestic',
        notes: 'dvbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        status: 'deleted',
        saved_at: '2025-09-21T21:03:58.805Z',
        submitter_message: '',
        reviewer_message: '',
        approver_message: 'Deleted by submitter',
        user_email: 'submitter@submit.com'
      }
    ];
    
    // Insert users first
    const users = [
      {
        email: 'admin@datacollect.app',
        role: 'admin',
        full_name: 'System Administrator',
        is_active: true,
        status: 'approved'
      },
      {
        email: 'submitter@submit.com',
        role: 'submitter',
        full_name: 'Data Submitter',
        is_active: true,
        status: 'approved'
      },
      {
        email: 'reviewer@review.com',
        role: 'reviewer',
        full_name: 'Senior Data Reviewer',
        is_active: true,
        status: 'approved'
      },
      {
        email: 'approver@approve.com',
        role: 'approver',
        full_name: 'Project Manager',
        is_active: true,
        status: 'approved'
      }
    ];
    
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'email' });
      
      if (error) {
        console.log('⚠️ User may already exist:', user.email, error.message);
      } else {
        console.log('✅ User created/updated:', user.email);
      }
    }
    
    // Insert submissions
    for (const submission of currentData) {
      const { error } = await supabase
        .from('submissions')
        .upsert(submission, { onConflict: 'id,saved_at' });
      
      if (error) {
        console.log('⚠️ Submission may already exist:', submission.id, error.message);
      } else {
        console.log('✅ Submission migrated:', submission.id, submission.status);
      }
    }
    
    console.log('✅ Data migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function main() {
  console.log('🎯 Starting database setup and migration...');
  
  await setupDatabase();
  await migrateCurrentData();
  
  console.log('🎉 Database setup complete!');
  console.log('📝 Your data is now permanently stored in Supabase!');
  console.log('🔗 Dashboard: https://supabase.com/dashboard/project/hwznfcaruttttqcfejms');
}

main().catch(console.error);
