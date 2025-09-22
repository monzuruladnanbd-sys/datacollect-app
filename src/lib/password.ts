import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// For production, you would use proper password hashing like bcrypt
// For now, using simple storage (should be upgraded for production)
interface PasswordRecord {
  user_email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

// Simple password storage in localStorage for development
// In production, this should be a secure database table with proper hashing
class PasswordManager {
  private static STORAGE_KEY = 'wb_user_passwords';
  private static FILE_PATH = path.join(process.cwd(), 'password-store.json');

  // Get stored passwords
  private static getPasswordStore(): Record<string, string> {
    if (typeof window === 'undefined') {
      // Server-side: use file-based storage for persistence
      try {
        if (fs.existsSync(this.FILE_PATH)) {
          const data = fs.readFileSync(this.FILE_PATH, 'utf8');
          const store = JSON.parse(data);
          console.log(`🔑 Getting server-side password store from file, keys:`, Object.keys(store));
          return store;
        } else {
          console.log(`🔑 Password file doesn't exist, returning empty store`);
          return {};
        }
      } catch (error) {
        console.error(`🔑 Error reading password file:`, error);
        return {};
      }
    }
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      console.log(`🔑 Getting client-side password store, keys:`, Object.keys(parsed));
      return parsed;
    } catch {
      console.log(`🔑 Error getting client-side password store, returning empty`);
      return {};
    }
  }

  // Save passwords
  private static savePasswordStore(store: Record<string, string>) {
    if (typeof window === 'undefined') {
      // Server-side: save to file for persistence
      try {
        console.log(`🔑 Saving server-side password store to file with keys:`, Object.keys(store));
        fs.writeFileSync(this.FILE_PATH, JSON.stringify(store, null, 2));
        console.log(`🔑 Server-side store saved to file successfully`);
      } catch (error) {
        console.error(`🔑 Error saving password file:`, error);
      }
    } else {
      try {
        console.log(`🔑 Saving client-side password store with keys:`, Object.keys(store));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
        console.log(`🔑 Client-side store saved successfully`);
      } catch (e) {
        console.error('Failed to save password store:', e);
      }
    }
  }

  // Store password for user
  static storePassword(email: string, password: string): void {
    const store = this.getPasswordStore();
    // In production, hash the password here using bcrypt or similar
    store[email.toLowerCase()] = password;
    this.savePasswordStore(store);
    console.log(`🔑 Password stored for: ${email}`);
  }

  // Verify password for user
  static verifyPassword(email: string, password: string): boolean {
    const store = this.getPasswordStore();
    const normalizedEmail = email.toLowerCase();
    const storedPassword = store[normalizedEmail];
    
    console.log(`🔑 Verifying password for: ${email}`);
    console.log(`🔑 Store keys during verification:`, Object.keys(store));
    console.log(`🔑 Stored password for ${email}:`, storedPassword ? 'Set' : 'Not set');
    console.log(`🔑 Provided password length:`, password ? password.length : 0);
    
    if (!storedPassword) {
      console.log(`❌ No password found for: ${email}`);
      return false;
    }
    
    // In production, compare hashed passwords here
    const isValid = storedPassword === password;
    console.log(`🔑 Password verification result for ${email}:`, isValid ? 'Valid' : 'Invalid');
    return isValid;
  }

  // Remove password (when user is deleted)
  static removePassword(email: string): void {
    const store = this.getPasswordStore();
    delete store[email.toLowerCase()];
    this.savePasswordStore(store);
  }

  // Change password (requires old password verification)
  static changePassword(email: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
    const store = this.getPasswordStore();
    const normalizedEmail = email.toLowerCase();
    
    console.log(`🔑 Change password called for: ${email}`);
    console.log(`🔑 Current store keys:`, Object.keys(store));
    console.log(`🔑 Current password for ${email}:`, store[normalizedEmail] ? 'Set' : 'Not set');
    
    // Verify old password
    if (!this.verifyPassword(email, oldPassword)) {
      console.log(`❌ Old password verification failed for: ${email}`);
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long' };
    }
    
    // Store new password
    console.log(`🔑 Storing new password for ${email}:`, newPassword);
    store[normalizedEmail] = newPassword;
    console.log(`🔑 Store after setting new password:`, store);
    this.savePasswordStore(store);
    
    console.log(`🔑 Password changed for: ${email}`);
    console.log(`🔑 New store keys:`, Object.keys(store));
    console.log(`🔑 New password for ${email}:`, store[normalizedEmail] ? 'Set' : 'Not set');
    console.log(`🔑 Actual new password stored:`, store[normalizedEmail]);
    return { success: true };
  }

  // Reset password (for forgot password - no old password required)
  static resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
    const store = this.getPasswordStore();
    const normalizedEmail = email.toLowerCase();
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }
    
    // Store new password
    store[normalizedEmail] = newPassword;
    this.savePasswordStore(store);
    
    console.log(`🔑 Password reset for: ${email}`);
    return { success: true };
  }

  // Initialize with default passwords for core users only
  static initializeDefaults() {
    const store = this.getPasswordStore();
    
    // Clear any old test account passwords
    const testAccounts = [
      'data@example.com',
      'admin@example.com', 
      'review@example.com',
      'approve@example.com',
      'monzurul.adnan.bd@gmail.com',
      'ada1@ada.com',
      'tester1@tester.com',
      'submitter@datacollect.app',
      'reviewer@datacollect.app',
      'approver@datacollect.app'
    ];
    
    let updated = false;
    for (const testAccount of testAccounts) {
      if (store[testAccount]) {
        delete store[testAccount];
        updated = true;
      }
    }
    
    // Add default passwords for core users only
    const defaults = {
      'admin@datacollect.app': 'admin123',
      'submitter@datacollect.app': 'Passw0rd!',
      'reviewer@datacollect.app': 'Passw0rd!',
      'approver@datacollect.app': 'Passw0rd!',
    };

    for (const [email, password] of Object.entries(defaults)) {
      // Only set the password if it doesn't already exist
      if (!store[email]) {
        store[email] = password;
        updated = true;
        console.log(`🔑 Setting default password for ${email}`);
      } else {
        console.log(`🔑 Password already exists for ${email}, keeping existing`);
      }
    }

    if (updated) {
      this.savePasswordStore(store);
    }
  }
}

// Initialize defaults only if password file doesn't exist
if (typeof window === 'undefined') {
  const fs = require('fs');
  const path = require('path');
  const FILE_PATH = path.join(process.cwd(), 'password-store.json');
  
  if (!fs.existsSync(FILE_PATH)) {
    console.log('🔑 Password file does not exist, initializing defaults');
    PasswordManager.initializeDefaults();
  } else {
    console.log('🔑 Password file exists, skipping initialization');
  }
} else {
  // Client-side: always initialize (localStorage)
  PasswordManager.initializeDefaults();
}

export { PasswordManager };
