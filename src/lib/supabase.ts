import { createClient } from '@supabase/supabase-js'
import { LocalDatabaseService } from './local-database'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Check if we have real Supabase configuration
export const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key'

if (!isSupabaseConfigured) {
  console.log('⚠️  Supabase not configured, using local database fallback')
  console.log('📖 To set up Supabase, see SUPABASE_SETUP.md')
}

// Database types
export interface DatabaseSubmission {
  id: string
  section: string
  level: string
  label: string
  value: string
  unit: string
  frequency: string
  period: string
  year: string
  quarter: string
  responsible: string
  disaggregation: string
  notes: string
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'deleted'
  saved_at: string
  submitter_message: string
  reviewer_message: string
  approver_message: string
  user_email: string
  assignedReviewer?: string
  assignedApprover?: string
  // User tracking fields
  submitted_by?: string
  reviewed_by?: string
  approved_by?: string
  rejected_by?: string
  deleted_by?: string
  restored_by?: string
  edited_by?: string
  // Timestamp fields for each operation
  submitted_at?: string
  reviewed_at?: string
  approved_at?: string
  rejected_at?: string
  deleted_at?: string
  restored_at?: string
  edited_at?: string
  created_at?: string
  updated_at?: string
}

export interface DatabaseUser {
  id: string
  email: string
  role: 'submitter' | 'reviewer' | 'approver' | 'admin'
  full_name: string
  is_active: boolean
  status: 'pending' | 'approved' | 'rejected'
  created_at?: string
  updated_at?: string
}

// Database operations
export class DatabaseService {
  
  // Submissions CRUD operations
  static async createSubmission(submission: Omit<DatabaseSubmission, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('submissions')
      .insert([submission])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getSubmissions(filters?: { 
    status?: string, 
    user_email?: string,
    limit?: number 
  }) {
    let query = supabase.from('submissions').select('*')
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.user_email) {
      query = query.eq('user_email', filters.user_email)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    query = query.order('saved_at', { ascending: false })
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async updateSubmission(id: string, savedAtOrUpdates: string | Partial<DatabaseSubmission>, updates?: Partial<DatabaseSubmission>) {
    if (typeof savedAtOrUpdates === 'string' && updates) {
      // New signature: updateSubmission(id, savedAt, updates)
      const { data, error } = await supabase
        .from('submissions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('saved_at', savedAtOrUpdates)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Old signature: updateSubmission(id, updates)
      const { data, error } = await supabase
        .from('submissions')
        .update({ ...(savedAtOrUpdates as Partial<DatabaseSubmission>), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }

  static async deleteSubmission(id: string, savedAt: string) {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id)
      .eq('saved_at', savedAt)
      // No status restriction - role-based permissions handled in API
    
    if (error) throw error
    return true
  }

  // Users CRUD operations
  static async createUser(user: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>) {
    if (!isSupabaseConfigured) {
      return LocalDatabaseService.createUser(user);
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getUsers(filters?: { role?: string, is_active?: boolean }) {
    if (!isSupabaseConfigured) {
      return LocalDatabaseService.getUsers(filters);
    }
    
    let query = supabase.from('users').select('*')
    
    if (filters?.role) {
      query = query.eq('role', filters.role)
    }
    
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async getUserByEmail(email: string) {
    if (!isSupabaseConfigured) {
      return LocalDatabaseService.getUserByEmail(email);
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
    return data
  }

  static async updateUser(id: string, updates: Partial<DatabaseUser>) {
    if (!isSupabaseConfigured) {
      return LocalDatabaseService.updateUser(id, updates);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Real-time subscriptions
  static subscribeToSubmissions(callback: (payload: any) => void) {
    return supabase
      .channel('submissions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'submissions' }, 
        callback
      )
      .subscribe()
  }

  static subscribeToUsers(callback: (payload: any) => void) {
    return supabase
      .channel('users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        callback
      )
      .subscribe()
  }
}


