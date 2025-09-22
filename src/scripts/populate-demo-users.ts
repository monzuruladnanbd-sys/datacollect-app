#!/usr/bin/env node

// Script to populate the database with demo users
// Run with: npx tsx src/scripts/populate-demo-users.ts

import { DatabaseService } from '../lib/supabase';
import { PasswordManager } from '../lib/password';

const demoUsers = [
  {
    email: 'admin@datacollect.app',
    role: 'admin' as const,
    full_name: 'System Administrator',
    is_active: true,
    password: 'admin123'
  },
  {
    email: 'data@example.com',
    role: 'submitter' as const,
    full_name: 'Data Submitter',
    is_active: true,
    password: 'Passw0rd!'
  },
  {
    email: 'field@example.com',
    role: 'submitter' as const,
    full_name: 'Field Data Collector',
    is_active: true,
    password: 'Passw0rd!'
  },
  {
    email: 'research@example.com',
    role: 'submitter' as const,
    full_name: 'Research Assistant',
    is_active: true,
    password: 'Passw0rd!'
  },
  {
    email: 'review@example.com',
    role: 'reviewer' as const,
    full_name: 'Senior Data Reviewer',
    is_active: true,
    password: 'Passw0rd!'
  },
  {
    email: 'review2@example.com',
    role: 'reviewer' as const,
    full_name: 'Data Quality Manager',
    is_active: true,
    password: 'Passw0rd!'
  },
  {
    email: 'review3@example.com',
    role: 'reviewer' as const,
    full_name: 'Technical Reviewer',
    is_active: true,
    password: 'Passw0rd!'
  },
  {
    email: 'approve@example.com',
    role: 'approver' as const,
    full_name: 'Project Manager',
    is_active: true,
    password: 'Passw0rd!'
  },
  {
    email: 'approve2@example.com',
    role: 'approver' as const,
    full_name: 'Department Head',
    is_active: true,
    password: 'Passw0rd!'
  },
  {
    email: 'approve3@example.com',
    role: 'approver' as const,
    full_name: 'Executive Director',
    is_active: true,
    password: 'Passw0rd!'
  },
  {
    email: 'monzurul.adnan.bd@gmail.com',
    role: 'submitter' as const,
    full_name: 'Monzurul Adnan',
    is_active: true,
    password: 'yourpassword' // You can change this
  }
];

async function populateDemoUsers() {
  console.log('🔄 Starting demo users population...');
  
  try {
    for (const userData of demoUsers) {
      const { password, ...userDbData } = userData;
      
      // Check if user already exists
      const existingUser = await DatabaseService.getUserByEmail(userData.email);
      
      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        // Still update password in case it changed
        PasswordManager.storePassword(userData.email, password);
        continue;
      }
      
      // Create user in database
      const newUser = await DatabaseService.createUser({
        ...userDbData,
        status: 'approved'
      });
      
      // Store password
      PasswordManager.storePassword(userData.email, password);
      
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }
    
    console.log('🎉 Demo users population completed successfully!');
    
    // Display summary
    const allUsers = await DatabaseService.getUsers();
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    console.log('👥 Users by role:');
    const roleStats = allUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count}`);
    });
    
    console.log('\n🔑 Demo Login Credentials:');
    console.log('   Admin: admin@datacollect.app / admin123');
    console.log('   Submitter: data@example.com / Passw0rd!');
    console.log('   Reviewer: review@example.com / Passw0rd!');
    console.log('   Approver: approve@example.com / Passw0rd!');
    
  } catch (error) {
    console.error('❌ Error populating demo users:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  populateDemoUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { populateDemoUsers };
