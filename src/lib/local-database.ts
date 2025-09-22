// Local database fallback for development without Supabase
// This simulates the database interface for immediate testing

import { DatabaseUser } from './supabase';

// In-memory storage that persists during dev session
// Use global to persist across module reloads
declare global {
  var localUsers: DatabaseUser[] | undefined;
  var localDbInitialized: boolean | undefined;
}

let localUsers: DatabaseUser[] = global.localUsers || [];
let initialized = global.localDbInitialized || false;

// Initialize with demo users
function initializeLocalDatabase() {
  console.log('🔄 initializeLocalDatabase called');
  
  // Always sync with global state first
  if (global.localUsers) {
    localUsers = global.localUsers;
    initialized = global.localDbInitialized || false;
    console.log('🔄 Synced with global state, initialized:', initialized, 'users:', localUsers.length);
  }
  
  // Don't reinitialize if users are deleted - this would restore deleted users!
  // Only reinitialize if we have no users at all
  if (initialized && localUsers.length === 0) {
    console.log('🔄 Reinitializing because no users found');
    initialized = false;
  }
  
  if (initialized) {
    console.log('🔄 Already initialized, returning');
    return;
  }
  
  localUsers = [
    {
      id: '1',
      email: 'admin@datacollect.app',
      role: 'admin',
      full_name: 'System Administrator',
      is_active: true,
      status: 'approved',
      created_at: new Date().toISOString(),
    },
    {
      id: '2', 
      email: 'submitter@submit.com',
      role: 'submitter',
      full_name: 'Data Submitter',
      is_active: true,
      status: 'approved',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      email: 'reviewer@review.com', 
      role: 'reviewer',
      full_name: 'Senior Data Reviewer',
      is_active: true,
      status: 'approved',
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      email: 'approver@approve.com',
      role: 'approver', 
      full_name: 'Project Manager',
      is_active: true,
      status: 'approved',
      created_at: new Date().toISOString(),
    }
  ];
  
  initialized = true;
  global.localUsers = localUsers;
  global.localDbInitialized = true;
  console.log('📦 Local database initialized with demo users');
}

export class LocalDatabaseService {
  
  static async createUser(user: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseUser> {
    initializeLocalDatabase();
    
    // Ensure we're using the latest global state
    localUsers = global.localUsers || localUsers;
    
    const newUser: DatabaseUser = {
      ...user,
      id: (localUsers.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Set status to pending for new users (except admin)
      status: user.role === 'admin' ? 'approved' : (user.status || 'pending'),
    };
    
    localUsers.push(newUser);
    global.localUsers = localUsers; // Persist to global
    console.log('✅ Local user created:', newUser.email, 'Status:', newUser.status);
    return newUser;
  }

  static async getUsers(filters?: { role?: string, is_active?: boolean }): Promise<DatabaseUser[]> {
    initializeLocalDatabase();
    
    // Ensure we're using the latest global state
    localUsers = global.localUsers || localUsers;
    console.log('🔄 getUsers called - syncing with global state');
    console.log('🔍 Current localUsers:', localUsers.map(u => ({ id: u.id, email: u.email, status: u.status, is_active: u.is_active })));
    console.log('🔍 Global state:', global.localUsers?.map((u: any) => ({ id: u.id, email: u.email, status: u.status, is_active: u.is_active })));
    
    let filteredUsers = localUsers;
    
    if (filters?.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    
    if (filters?.is_active !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.is_active === filters.is_active);
    }
    
    return filteredUsers;
  }

  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    initializeLocalDatabase();
    
    // Ensure we're using the latest global state
    localUsers = global.localUsers || localUsers;
    
    console.log(`🔍 Searching for user: ${email} in ${localUsers.length} local users`);
    console.log('📋 Available users:', localUsers.map(u => u.email));
    
    const user = localUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && user.is_active
    );
    
    if (user) {
      console.log(`✅ Found local user: ${user.email}`);
    } else {
      console.log(`❌ User not found in local database: ${email}`);
    }
    
    return user || null;
  }

  static async updateUser(id: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser> {
    initializeLocalDatabase();
    
    console.log('🔄 updateUser called with ID:', id, 'updates:', updates);
    console.log('🔍 Current users:', localUsers.map(u => ({ id: u.id, email: u.email, status: u.status })));
    
    console.log('🔍 Searching for user ID:', id, 'type:', typeof id);
    console.log('🔍 Available user IDs:', localUsers.map(u => ({ id: u.id, type: typeof u.id })));
    
    // Try multiple ID matching strategies
    let userIndex = localUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      userIndex = localUsers.findIndex(user => user.id === String(id));
    }
    if (userIndex === -1) {
      userIndex = localUsers.findIndex(user => String(user.id) === id);
    }
    if (userIndex === -1) {
      userIndex = localUsers.findIndex(user => String(user.id) === String(id));
    }
    
    console.log('🔍 User index found:', userIndex);
    
    if (userIndex === -1) {
      console.error('❌ User not found with ID:', id);
      throw new Error('User not found');
    }
    
    console.log('📝 Before update:', localUsers[userIndex]);
    
    localUsers[userIndex] = {
      ...localUsers[userIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    console.log('📝 After update:', localUsers[userIndex]);
    
    // Persist to global
    global.localUsers = localUsers;
    console.log('✅ Update completed and persisted to global');
    console.log('🔍 Global state after update:', global.localUsers.map((u: any) => ({ id: u.id, email: u.email, status: u.status, is_active: u.is_active })));
    
    // Force a complete state refresh
    console.log('🔄 Forcing complete state refresh...');
    const refreshedUsers = await LocalDatabaseService.getUsers();
    console.log('🔍 Refreshed users after update:', refreshedUsers.map((u: any) => ({ id: u.id, email: u.email, status: u.status, is_active: u.is_active })));
    
    return localUsers[userIndex];
  }

  static async deleteUser(id: string): Promise<void> {
    initializeLocalDatabase();
    
    console.log('🗑️ Attempting to delete user with ID:', id);
    console.log('🗑️ Current localUsers before deletion:', localUsers.map(u => ({ id: u.id, email: u.email })));
    
    // Ensure we're using the latest global state
    localUsers = global.localUsers || localUsers;
    console.log('🗑️ Synced localUsers before deletion:', localUsers.map(u => ({ id: u.id, email: u.email })));
    
    const userIndex = localUsers.findIndex(user => user.id === id);
    console.log('🗑️ User index found:', userIndex);
    
    if (userIndex === -1) {
      console.error('🗑️ User not found with ID:', id);
      throw new Error('User not found');
    }
    
    const deletedUser = localUsers[userIndex];
    localUsers.splice(userIndex, 1);
    
    // Persist to global
    global.localUsers = localUsers;
    console.log('🗑️ User deleted:', deletedUser.email, 'ID:', id);
    console.log('🗑️ Remaining users:', localUsers.map(u => ({ id: u.id, email: u.email })));
    console.log('🗑️ Global state updated:', global.localUsers.map((u: any) => ({ id: u.id, email: u.email })));
  }
}
