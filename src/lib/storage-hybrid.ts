// Hybrid storage system - uses database when available, localStorage as fallback
import * as DatabaseStorage from './database'
import * as MemoryStorage from './storage'

// Check if Supabase is configured
const isDatabaseAvailable = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key'
  )
}

// Log storage mode
const storageMode = isDatabaseAvailable() ? 'DATABASE' : 'MEMORY';
console.log(`🗄️ Storage Mode: ${storageMode}`);

// Export the appropriate storage functions
export const addRow = isDatabaseAvailable() 
  ? DatabaseStorage.addRow 
  : MemoryStorage.addRow

export const getRows = isDatabaseAvailable() 
  ? DatabaseStorage.getRows 
  : MemoryStorage.getRows

export const updateRow = isDatabaseAvailable() 
  ? DatabaseStorage.updateRow 
  : MemoryStorage.updateRow

export const getRowById = isDatabaseAvailable() 
  ? DatabaseStorage.getRowById 
  : MemoryStorage.getRowById

export const getRowsByStatus = isDatabaseAvailable() 
  ? DatabaseStorage.getRowsByStatus 
  : MemoryStorage.getRowsByStatus

export const deleteRow = isDatabaseAvailable() 
  ? DatabaseStorage.deleteRow 
  : MemoryStorage.deleteRow

export const getRowsByUser = isDatabaseAvailable() 
  ? DatabaseStorage.getRowsByUser 
  : MemoryStorage.getRowsByUser

export const clearData = isDatabaseAvailable() 
  ? DatabaseStorage.clearData 
  : MemoryStorage.clearData

// Database-only functions (graceful fallback)
export const createUser = isDatabaseAvailable() 
  ? DatabaseStorage.createUser 
  : async () => { throw new Error('Database required for user management') }

export const getUserByEmail = isDatabaseAvailable() 
  ? DatabaseStorage.getUserByEmail 
  : async () => null

export const getAllUsers = isDatabaseAvailable() 
  ? DatabaseStorage.getAllUsers 
  : async () => []

// Re-export types
export type { DataRow } from './database'




