import { User, Role } from "./session";
import { DatabaseService, DatabaseUser } from "./supabase";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  passwordHash: string;
}

// Convert database user to UserProfile format
function dbUserToProfile(dbUser: DatabaseUser, passwordHash?: string): UserProfile {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.full_name,
    role: dbUser.role,
    isActive: dbUser.is_active,
    createdAt: dbUser.created_at || new Date().toISOString(),
    passwordHash: passwordHash || '', // In production, this should be properly hashed
  };
}

// Convert UserProfile to database user format
function profileToDbUser(profile: Omit<UserProfile, 'id' | 'createdAt' | 'passwordHash'>): Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'> {
  return {
    email: profile.email,
    role: profile.role,
    full_name: profile.name,
    is_active: profile.isActive,
    status: 'approved',
  };
}

export interface UserStats {
  totalUsers: number;
  submitters: number;
  reviewers: number;
  approvers: number;
  activeUsers: number;
}

import { PasswordManager } from "./password";

// Password manager initialization is handled in password.ts

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const dbUsers = await DatabaseService.getUsers(); // Get all users, not just active ones
    return dbUsers.map(user => dbUserToProfile(user));
  } catch (error) {
    console.error('Database error, using local fallback for users:', error);
    // Return empty array - the local users will be handled by the LocalDatabaseService
    return [];
  }
}

export async function getUserByEmail(email: string): Promise<UserProfile | undefined> {
  try {
    const dbUser = await DatabaseService.getUserByEmail(email);
    if (!dbUser) return undefined;
    return dbUserToProfile(dbUser);
  } catch (error) {
    console.error('Error fetching user by email, this is expected when using local fallback:', error);
    // Return undefined so the system continues with local fallback
    return undefined;
  }
}

export async function getUserById(id: string): Promise<UserProfile | undefined> {
  try {
    const dbUsers = await DatabaseService.getUsers();
    const dbUser = dbUsers.find(user => user.id === id && user.is_active);
    if (!dbUser) return undefined;
    return dbUserToProfile(dbUser);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return undefined;
  }
}

export async function createUser(userData: Omit<UserProfile, 'id' | 'createdAt' | 'passwordHash'> & { password: string }): Promise<UserProfile> {
  try {
    // Create user in database with pending status (except for admin)
    const dbUserData = {
      ...profileToDbUser(userData),
      status: userData.role === 'admin' ? 'approved' : 'pending' as 'pending' | 'approved' | 'rejected'
    };
    
    const dbUser = await DatabaseService.createUser(dbUserData);
    
    // Store password separately
    PasswordManager.storePassword(userData.email, userData.password);
    
    return dbUserToProfile(dbUser, userData.password);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const dbUpdates: Partial<DatabaseUser> = {};
    
    if (updates.name) dbUpdates.full_name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    
    const updatedDbUser = await DatabaseService.updateUser(id, dbUpdates);
    return dbUserToProfile(updatedDbUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function deactivateUser(id: string): Promise<boolean> {
  try {
    await DatabaseService.updateUser(id, { is_active: false });
    return true;
  } catch (error) {
    console.error('Error deactivating user:', error);
    return false;
  }
}

export async function getUserStats(): Promise<UserStats> {
  try {
    const activeUsers = await getAllUsers();
    return {
      totalUsers: activeUsers.length,
      submitters: activeUsers.filter(user => user.role === "submitter").length,
      reviewers: activeUsers.filter(user => user.role === "reviewer").length,
      approvers: activeUsers.filter(user => user.role === "approver").length,
      activeUsers: activeUsers.length,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { totalUsers: 0, submitters: 0, reviewers: 0, approvers: 0, activeUsers: 0 };
  }
}

export async function getUsersByRole(role: Role): Promise<UserProfile[]> {
  try {
    const dbUsers = await DatabaseService.getUsers({ role, is_active: true });
    return dbUsers.map(user => dbUserToProfile(user));
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
}

export async function validateUserCredentials(email: string, password: string): Promise<UserProfile | null> {
  try {
    console.log(`🔍 Attempting login for: ${email}`);
    
    // Check if Supabase is configured
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key';

    let user: UserProfile | undefined;
    let dbUser: any;

    if (!isSupabaseConfigured) {
      // Use local database directly
      console.log('🏠 Using local database for authentication');
      const { LocalDatabaseService } = await import('./local-database');
      dbUser = await LocalDatabaseService.getUserByEmail(email);
      if (dbUser) {
        user = dbUserToProfile(dbUser);
      }
    } else {
      // Try Supabase first
      dbUser = await DatabaseService.getUserByEmail(email);
      if (dbUser) {
        user = dbUserToProfile(dbUser);
      }
    }
    
    if (!user || !dbUser) {
      console.log(`❌ User not found: ${email}`);
      return null;
    }
    
    // Check user status - only approved users can login
    if (dbUser.status !== 'approved') {
      console.log(`❌ User not approved: ${email}, Status: ${dbUser.status}`);
      return null;
    }
    
    // Verify password
    const passwordValid = PasswordManager.verifyPassword(email, password);
    if (!passwordValid) {
      console.log(`❌ Invalid password for: ${email}`);
      return null;
    }
    
    console.log(`✅ Login successful for: ${email}`);
    
    // Update last login (skip if update fails)
    try {
      if (!isSupabaseConfigured) {
        console.log('⏭️ Skipping last login update for local database');
      } else {
        await updateUser(user.id, { lastLogin: new Date().toISOString() });
      }
    } catch (updateError) {
      console.log('Could not update last login, continuing anyway');
    }
    
    return user;
  } catch (error) {
    console.error('Error validating credentials:', error);
    return null;
  }
}

export async function canAddUser(role: Role): Promise<boolean> {
  try {
    const stats = await getUserStats();
    
    // Check role limits
    if (role === "reviewer" && stats.reviewers >= 3) return false;
    if (role === "approver" && stats.approvers >= 3) return false;
    
    return true;
  } catch (error) {
    console.error('Error checking user limits:', error);
    return false;
  }
}

export async function getAvailableRoles(): Promise<{ role: Role; available: boolean; current: number; max?: number }[]> {
  try {
    const stats = await getUserStats();
    
    return [
      { role: "submitter", available: true, current: stats.submitters },
      { role: "reviewer", available: stats.reviewers < 3, current: stats.reviewers, max: 3 },
      { role: "approver", available: stats.approvers < 3, current: stats.approvers, max: 3 },
      { role: "admin", available: false, current: 1, max: 1 }, // Only one admin
    ];
  } catch (error) {
    console.error('Error getting available roles:', error);
    return [];
  }
}

// User registration (for submitters only)
export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  department?: string;
  phone?: string;
}): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  try {
    // Check if email already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }

    // Create new submitter user with pending status
    const newUser = await createUser({
      ...userData,
      role: "submitter",
      isActive: true,
    });

    return { 
      success: true, 
      message: "Registration successful. Your account is pending approval.", 
      user: newUser 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: "Registration failed. Please try again." };
  }
}

// Change user role (admin only)
export async function changeUserRole(userId: string, newRole: Role): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if trying to change to admin (only one admin allowed)
    if (newRole === "admin") {
      const allUsers = await getAllUsers();
      const adminCount = allUsers.filter(u => u.role === "admin" && u.isActive).length;
      if (adminCount >= 1) {
        return { success: false, message: "Only one admin user is allowed" };
      }
    }

    // Check role limits
    const canAdd = await canAddUser(newRole);
    if (!canAdd && user.role !== newRole) {
      return { success: false, message: `Cannot change to ${newRole}. Limit reached.` };
    }

    // Update user role
    const updated = await updateUser(userId, { role: newRole });
    if (!updated) {
      return { success: false, message: "Failed to update user role" };
    }

    return { success: true, message: `User role changed to ${newRole}` };
  } catch (error) {
    console.error('Error changing user role:', error);
    return { success: false, message: "Failed to update user role" };
  }
}

// Check if user can manage roles
export function canManageRoles(user: UserProfile | null): boolean {
  return user?.role === "admin";
}

// Get users that can be promoted/demoted
export async function getManageableUsers(): Promise<UserProfile[]> {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => user.isActive && user.role !== "admin");
  } catch (error) {
    console.error('Error getting manageable users:', error);
    return [];
  }
}

// Get pending users (for admin approval)
export async function getPendingUsers(): Promise<UserProfile[]> {
  try {
    // Direct approach - access global state directly
    const { LocalDatabaseService } = await import('./local-database');
    
    // Force refresh the local database
    await LocalDatabaseService.getUsers();
    
    // Access global state directly
    const globalUsers = (global as any).localUsers || [];
    console.log('🔍 Direct access - Global users:', globalUsers.length);
    
    // Filter for pending users - be more strict about the filter
    const pendingUsers = globalUsers.filter((user: any) => {
      const isPending = user.status === 'pending';
      console.log(`🔍 User ${user.email}: status=${user.status}, isPending=${isPending}`);
      return isPending;
    });
    console.log('⏳ Direct access - Pending users found:', pendingUsers.length);
    console.log('📝 Pending users:', pendingUsers.map((u: any) => ({ email: u.email, status: u.status, is_active: u.is_active })));
    console.log('🔍 All users status check:', globalUsers.map((u: any) => ({ email: u.email, status: u.status, is_active: u.is_active, id: u.id })));
    
    // Convert to UserProfile format
    const convertedUsers = pendingUsers.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.full_name || user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at || new Date().toISOString(),
      passwordHash: ''
    }));
    
    console.log('✅ Direct access - Converted users:', convertedUsers.length);
    return convertedUsers;
  } catch (error) {
    console.error('❌ Error getting pending users:', error);
    return [];
  }
}

// Approve user
export async function approveUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🚀 approveUser function called with ID:', userId);
    
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key';

    console.log('🔍 Supabase configured:', isSupabaseConfigured);

    if (!isSupabaseConfigured) {
      console.log('🏠 Using local database for approval');
      // Use local database
      const { LocalDatabaseService } = await import('./local-database');
      const result = await LocalDatabaseService.updateUser(userId, { 
        status: 'approved',
        is_active: true 
      });
      console.log('✅ Local database update completed, result:', result);
      
      // Verify the update by checking the user again
      const { LocalDatabaseService: LDS } = await import('./local-database');
      const allUsers = await LDS.getUsers();
      const updatedUser = allUsers.find(u => u.id === userId);
      console.log('🔍 Verification - Updated user:', updatedUser);
    } else {
      console.log('☁️ Using Supabase for approval');
      // Use Supabase
      await DatabaseService.updateUser(userId, { 
        status: 'approved',
        is_active: true 
      });
      console.log('✅ Supabase update completed');
    }

    console.log('✅ User approval successful');
    return { success: true, message: "User approved successfully" };
  } catch (error) {
    console.error('❌ Error approving user:', error);
    return { success: false, message: "Failed to approve user" };
  }
}

// Reject user
export async function rejectUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key';

    if (!isSupabaseConfigured) {
      // Use local database
      const { LocalDatabaseService } = await import('./local-database');
      await LocalDatabaseService.updateUser(userId, { status: 'rejected' });
    } else {
      // Use Supabase
      await DatabaseService.updateUser(userId, { status: 'rejected' });
    }

    return { success: true, message: "User rejected successfully" };
  } catch (error) {
    console.error('Error rejecting user:', error);
    return { success: false, message: "Failed to reject user" };
  }
}

// Reactivate user
export async function reactivateUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key';

    if (!isSupabaseConfigured) {
      // Use local database
      const { LocalDatabaseService } = await import('./local-database');
      await LocalDatabaseService.updateUser(userId, { is_active: true });
    } else {
      // Use Supabase
      await DatabaseService.updateUser(userId, { is_active: true });
    }

    return { success: true, message: "User reactivated successfully" };
  } catch (error) {
    console.error('Error reactivating user:', error);
    return { success: false, message: "Failed to reactivate user" };
  }
}

// Delete user
export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🗑️ deleteUser function called with ID:', userId);
    
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key';

    console.log('🗑️ Supabase configured:', isSupabaseConfigured);

    if (!isSupabaseConfigured) {
      // Use local database
      console.log('🗑️ Using local database for deletion');
      const { LocalDatabaseService } = await import('./local-database');
      
      // Check global state before deletion
      console.log('🗑️ Global state before deletion:', (global as any).localUsers?.map((u: any) => ({ id: u.id, email: u.email })));
      
      await LocalDatabaseService.deleteUser(userId);
      
      // Check global state after deletion
      console.log('🗑️ Global state after deletion:', (global as any).localUsers?.map((u: any) => ({ id: u.id, email: u.email })));
      
      console.log('🗑️ Local database deletion completed');
    } else {
      // Use Supabase - soft delete for now
      console.log('🗑️ Using Supabase for deletion');
      await DatabaseService.updateUser(userId, { is_active: false });
      console.log('🗑️ Supabase deletion completed');
    }

    console.log('🗑️ User deletion successful');
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error('🗑️ Error deleting user:', error);
    return { success: false, message: "Failed to delete user" };
  }
}
