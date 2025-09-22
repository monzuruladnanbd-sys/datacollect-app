// User consistency management system
// This ensures all user data uses consistent formats across the application

export interface ConsistentUser {
  id: string;
  email: string;
  role: string;
  name: string;
  isActive: boolean;
  status: string;
}

export class UserConsistencyManager {
  // Normalize user email format
  static normalizeEmail(email: string): string {
    if (!email) return '';
    return email.toLowerCase().trim();
  }

  // Check if two user identifiers refer to the same user
  static isSameUser(user1: string, user2: string): boolean {
    if (!user1 || !user2) return false;
    
    const normalized1 = this.normalizeEmail(user1);
    const normalized2 = this.normalizeEmail(user2);
    
    // Direct match
    if (normalized1 === normalized2) return true;
    
    // Extract base username (before @)
    const base1 = normalized1.split('@')[0];
    const base2 = normalized2.split('@')[0];
    
    // Check if base usernames match
    if (base1 === base2) return true;
    
    // Special cases for known users
    const knownMappings: { [key: string]: string[] } = {
      'admin': ['admin@datacollect.app'],
      'submitter': ['submitter@submit.com'],
      'reviewer': ['reviewer@review.com'],
      'approver': ['approver@approve.com']
    };

    for (const [base, variations] of Object.entries(knownMappings)) {
      if (variations.includes(normalized1) && variations.includes(normalized2)) {
        return true;
      }
    }
    
    return false;
  }

  // Get the canonical user format for data storage
  static getCanonicalUserFormat(userIdentifier: string): string {
    if (!userIdentifier) return '';
    
    const normalized = this.normalizeEmail(userIdentifier);
    
    // Map to canonical formats
    const canonicalMappings: { [key: string]: string } = {
      'admin@datacollect.app': 'admin@datacollect.app',
      'submitter@submit.com': 'submitter@submit.com',
      'reviewer@review.com': 'reviewer@review.com',
      'approver@approve.com': 'approver@approve.com'
    };

    // Check direct mapping first
    if (canonicalMappings[normalized]) {
      return canonicalMappings[normalized];
    }

    // Extract base and check if it has a canonical format
    const base = normalized.split('@')[0];
    if (canonicalMappings[base]) {
      return canonicalMappings[base];
    }

    // Return the normalized email if it looks like an email
    if (normalized.includes('@')) {
      return normalized;
    }

    // If it's just a username, try to find a canonical format
    return normalized;
  }

  // Validate user consistency across the system
  static async validateUserConsistency(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check session user
      const { getSession } = await import('@/lib/auth');
      const session = await getSession();
      
      if (session.user) {
        console.log('📋 Session user:', session.user);
        
        // Check if user exists in database
        const { LocalDatabaseService } = await import('@/lib/local-database');
        const dbUser = await LocalDatabaseService.getUserByEmail(session.user.email);
        
        if (!dbUser) {
          issues.push(`Session user ${session.user.email} not found in database`);
          recommendations.push(`Add ${session.user.email} to local database`);
        } else {
          console.log('✅ Session user found in database:', dbUser.email);
        }
      } else {
        issues.push('No user in session');
      }

      // Check sample data consistency
      const { forceRefreshSampleData } = await import('@/lib/database');
      const sampleData = forceRefreshSampleData();
      
      const sampleUsers = sampleData.length > 0 ? Array.from(new Set(sampleData.map((item: any) => item.user))) : [];
      console.log('📊 Sample data users:', sampleUsers);
      
      // Check if sample data users exist in database
      const { LocalDatabaseService } = await import('./local-database');
      for (const sampleUser of sampleUsers) {
        const dbUser = await LocalDatabaseService.getUserByEmail(sampleUser);
        if (!dbUser) {
          issues.push(`Sample data user ${sampleUser} not found in database`);
          recommendations.push(`Add ${sampleUser} to local database or update sample data`);
        }
      }

      // Check password consistency
      const { PasswordManager } = await import('@/lib/password');
      const passwordStore = (PasswordManager as any).getPasswordStore();
      const passwordKeys = Object.keys(passwordStore);
      
      console.log('🔐 Password store keys:', passwordKeys);
      
      // Check if all database users have passwords
      const allUsers = await LocalDatabaseService.getUsers();
      for (const user of allUsers) {
        if (!passwordStore[user.email]) {
          issues.push(`User ${user.email} has no password set`);
          recommendations.push(`Set password for ${user.email}`);
        }
      }

    } catch (error) {
      issues.push(`Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  // Fix user consistency issues
  static async fixUserConsistency(): Promise<{
    success: boolean;
    fixed: string[];
    errors: string[];
  }> {
    const fixed: string[] = [];
    const errors: string[] = [];

    try {
      // 1. Ensure all users in database have passwords
      const { LocalDatabaseService } = await import('@/lib/local-database');
      const { PasswordManager } = await import('@/lib/password');
      
      const allUsers = await LocalDatabaseService.getUsers();
      const passwordStore = (PasswordManager as any).getPasswordStore();
      
      for (const user of allUsers) {
        if (!passwordStore[user.email]) {
          // Set default password
          PasswordManager.storePassword(user.email, 'test123');
          fixed.push(`Set password for ${user.email}`);
        }
      }

      // 2. Update sample data to use canonical user formats
      const { forceRefreshSampleData } = await import('@/lib/database');
      const sampleData = forceRefreshSampleData();
      
      let sampleDataUpdated = false;
      const updatedSampleData = sampleData.map((item: any) => {
        const canonicalUser = this.getCanonicalUserFormat(item.user);
        if (canonicalUser !== item.user) {
          sampleDataUpdated = true;
          fixed.push(`Updated sample data user ${item.user} -> ${canonicalUser}`);
          return { ...item, user: canonicalUser };
        }
        return item;
      });

      if (sampleDataUpdated) {
        // Force update the global sample data store
        (global as any).__sampleDataStore = updatedSampleData;
      }

      // 3. Ensure user database is initialized
      await LocalDatabaseService.getUsers(); // This will initialize if needed
      fixed.push('Ensured user database is initialized');

    } catch (error) {
      errors.push(`Error fixing consistency: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      success: errors.length === 0,
      fixed,
      errors
    };
  }
}
