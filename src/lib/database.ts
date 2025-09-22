import { DatabaseService, DatabaseSubmission, DatabaseUser } from './supabase'

// Data types compatible with existing code
export interface DataRow {
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
  savedAt: string
  submitterMessage: string
  reviewerMessage: string
  approverMessage: string
  user: string
  assignedReviewer?: string
  assignedApprover?: string
  // User tracking fields
  submittedBy?: string
  reviewedBy?: string
  approvedBy?: string
  rejectedBy?: string
  deletedBy?: string
  restoredBy?: string
  editedBy?: string
  // Timestamp fields for each operation
  submittedAt?: string
  reviewedAt?: string
  approvedAt?: string
  rejectedAt?: string
  deletedAt?: string
  restoredAt?: string
  editedAt?: string
}

// Convert between database and app formats
function dbToApp(dbRow: DatabaseSubmission): DataRow {
  return {
    id: dbRow.id,
    section: dbRow.section,
    level: dbRow.level,
    label: dbRow.label,
    value: dbRow.value,
    unit: dbRow.unit || '',
    frequency: dbRow.frequency || '',
    period: dbRow.period || '',
    year: dbRow.year || '',
    quarter: dbRow.quarter || '',
    responsible: dbRow.responsible || '',
    disaggregation: dbRow.disaggregation || '',
    notes: dbRow.notes || '',
    status: dbRow.status,
    savedAt: dbRow.saved_at,
    submitterMessage: dbRow.submitter_message || '',
    reviewerMessage: dbRow.reviewer_message || '',
    approverMessage: dbRow.approver_message || '',
    user: dbRow.user_email,
    assignedReviewer: dbRow.assignedReviewer,
    assignedApprover: dbRow.assignedApprover,
    // User tracking fields
    submittedBy: dbRow.submitted_by,
    reviewedBy: dbRow.reviewed_by,
    approvedBy: dbRow.approved_by,
    rejectedBy: dbRow.rejected_by,
    deletedBy: dbRow.deleted_by,
    restoredBy: dbRow.restored_by,
    editedBy: dbRow.edited_by,
    // Timestamp fields
    submittedAt: dbRow.submitted_at,
    reviewedAt: dbRow.reviewed_at,
    approvedAt: dbRow.approved_at,
    rejectedAt: dbRow.rejected_at,
    deletedAt: dbRow.deleted_at,
    restoredAt: dbRow.restored_at,
    editedAt: dbRow.edited_at
  }
}

function appToDb(appRow: DataRow): Omit<DatabaseSubmission, 'created_at' | 'updated_at'> {
  return {
    id: appRow.id,
    section: appRow.section,
    level: appRow.level,
    label: appRow.label,
    value: appRow.value,
    unit: appRow.unit,
    frequency: appRow.frequency,
    period: appRow.period,
    year: appRow.year,
    quarter: appRow.quarter,
    responsible: appRow.responsible,
    disaggregation: appRow.disaggregation,
    notes: appRow.notes,
    status: appRow.status,
    saved_at: appRow.savedAt,
    submitter_message: appRow.submitterMessage,
    reviewer_message: appRow.reviewerMessage,
    approver_message: appRow.approverMessage,
    user_email: appRow.user,
    assignedReviewer: appRow.assignedReviewer,
    assignedApprover: appRow.assignedApprover,
    // User tracking fields
    submitted_by: appRow.submittedBy,
    reviewed_by: appRow.reviewedBy,
    approved_by: appRow.approvedBy,
    rejected_by: appRow.rejectedBy,
    deleted_by: appRow.deletedBy,
    restored_by: appRow.restoredBy,
    edited_by: appRow.editedBy,
    // Timestamp fields
    submitted_at: appRow.submittedAt,
    reviewed_at: appRow.reviewedAt,
    approved_at: appRow.approvedAt,
    rejected_at: appRow.rejectedAt,
    deleted_at: appRow.deletedAt,
    restored_at: appRow.restoredAt,
    edited_at: appRow.editedAt
  }
}

// Database operations that match the existing storage interface
export async function addRow(row: DataRow) {
  try {
    console.log("Adding row to database:", row);
    const dbRow = appToDb(row);
    const result = await DatabaseService.createSubmission(dbRow);
    console.log("Added row to database:", result.id);
    return result;
  } catch (error) {
    console.error("Database error adding row:", error);
    console.log("Fallback: storing in global user data store");
    
    // Store in global user data store for persistence
    console.log("🔍 DEBUGGING: Before storage - globalThis.__userDataStore =", globalThis.__userDataStore);
    
    if (!globalThis.__userDataStore) {
      globalThis.__userDataStore = [];
      console.log("🔍 DEBUGGING: Initialized empty global storage");
    }
    
    globalThis.__userDataStore.push(row);
    console.log("✅ Stored row in global user data store:", row.id, "Total rows:", globalThis.__userDataStore.length);
    console.log("✅ Global storage now contains:", globalThis.__userDataStore.map(item => ({ id: item.id, user: item.user })));
    
    const dbRowFallback = appToDb(row);
    return { ...dbRowFallback };
  }
}

export async function getRows(): Promise<DataRow[]> {
  let dbRows: DataRow[] = [];
  
  try {
    console.log("Fetching rows from database");
    const dbSubmissions = await DatabaseService.getSubmissions();
    dbRows = dbSubmissions.map(dbToApp);
    console.log("Retrieved rows from database:", dbRows.length);
  } catch (error) {
    console.error("Database error fetching rows:", error);
    console.log("Database fetch failed, will use fallback storage only");
  }
  
  // Always check for fallback storage and merge with database data
  console.log("🔍 DEBUGGING: Checking global storage...");
  console.log("🔍 DEBUGGING: globalThis.__userDataStore =", globalThis.__userDataStore);
  console.log("🔍 DEBUGGING: globalThis.__userDataStore?.length =", globalThis.__userDataStore?.length);
  
  let fallbackRows: DataRow[] = [];
  if (globalThis.__userDataStore && globalThis.__userDataStore.length > 0) {
    console.log("✅ Found stored user data:", globalThis.__userDataStore.length, "rows");
    console.log("✅ Fallback data:", globalThis.__userDataStore.map(item => ({ id: item.id, user: item.user })));
    fallbackRows = globalThis.__userDataStore;
  }
  
  // Merge database rows with fallback storage rows
  const allRows = [...dbRows, ...fallbackRows];
  console.log("🔍 DEBUGGING: Combined rows - DB:", dbRows.length, "Fallback:", fallbackRows.length, "Total:", allRows.length);
  
  // Remove duplicates based on id and savedAt (keep the most recent)
  const uniqueRows = allRows.reduce((acc, row) => {
    const existingIndex = acc.findIndex(existing => existing.id === row.id);
    if (existingIndex === -1) {
      acc.push(row);
    } else {
      // Keep the most recent record
      const existing = acc[existingIndex];
      const existingTime = new Date(existing.savedAt).getTime();
      const currentTime = new Date(row.savedAt).getTime();
      if (currentTime > existingTime) {
        acc[existingIndex] = row;
      }
    }
    return acc;
  }, [] as DataRow[]);
  
  console.log("🔍 DEBUGGING: Final unique rows:", uniqueRows.length);
  console.log("🔍 DEBUGGING: Final data:", uniqueRows.map(item => ({ id: item.id, user: item.user, status: item.status })));
  
  return uniqueRows;
}

// Global store for sample data persistence
declare global {
  var __sampleDataStore: DataRow[] | undefined;
  var __userDataStore: DataRow[] | undefined;
}

// Sample data for development/testing when database is not configured
function getSampleData(): DataRow[] {
        // Force clear any existing sample data to avoid user mismatches
        console.log('🔄 Force clearing sample data - starting with empty submissions');
        globalThis.__sampleDataStore = [];
        
        // Also clear any cached data in the global state
        if (typeof global !== 'undefined') {
          (global as any).__sampleDataStore = [];
        }
        
        // Force clear any cached data in the global state
        if (typeof globalThis !== 'undefined') {
          globalThis.__sampleDataStore = [];
        }
        
        console.log('✅ Sample data completely cleared - no test data will be generated');
        return [];
    }

export async function updateSpecificRow(id: string, savedAt: string, updates: Partial<DataRow>) {
  try {
    console.log("Updating specific row in database:", id, savedAt, updates);
    
    // First try to find the record in the database
    let targetRecord: DataRow | null = null;
    
    try {
      const allRows = await getRows();
      targetRecord = allRows.find(row => row.id === id && row.savedAt === savedAt) || null;
    } catch (error) {
      console.log("Error getting rows for update:", error);
    }
    
    // If not found in database, check fallback storage
    if (!targetRecord && globalThis.__userDataStore) {
      // First try exact timestamp match
      targetRecord = globalThis.__userDataStore.find(row => row.id === id && row.savedAt === savedAt) || null;
      
      // If no exact match, find the most recent record with this ID
      if (!targetRecord) {
        const recordsWithId = globalThis.__userDataStore.filter(row => row.id === id);
        if (recordsWithId.length > 0) {
          // Sort by timestamp and get the most recent one
          targetRecord = recordsWithId.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())[0];
          console.log("Found most recent record with ID in fallback storage:", targetRecord.savedAt);
        }
      }
      console.log("Found record in fallback storage:", targetRecord ? "Yes" : "No");
    }
    
    if (!targetRecord) {
      console.log("Target record not found for update");
      return null;
    }
    
    try {
      // Try database update
      const dbUpdates: Partial<DatabaseSubmission> = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.submitterMessage) dbUpdates.submitter_message = updates.submitterMessage;
      if (updates.reviewerMessage) dbUpdates.reviewer_message = updates.reviewerMessage;
      if (updates.approverMessage) dbUpdates.approver_message = updates.approverMessage;
      if (updates.savedAt) dbUpdates.saved_at = updates.savedAt;
      if (updates.value) dbUpdates.value = updates.value;
      if (updates.unit) dbUpdates.unit = updates.unit;
      if (updates.frequency) dbUpdates.frequency = updates.frequency;
      if (updates.responsible) dbUpdates.responsible = updates.responsible;
      if (updates.disaggregation) dbUpdates.disaggregation = updates.disaggregation;
      if (updates.notes) dbUpdates.notes = updates.notes;
      if (updates.editedBy) dbUpdates.edited_by = updates.editedBy;
      if (updates.editedAt) dbUpdates.edited_at = updates.editedAt;
      if (updates.submittedBy) dbUpdates.submitted_by = updates.submittedBy;
      if (updates.submittedAt) dbUpdates.submitted_at = updates.submittedAt;
      
      const result = await DatabaseService.updateSubmission(id, savedAt, dbUpdates);
      console.log("Database update successful");
      return result;
    } catch (dbError) {
      console.log("Database update failed, updating global user data store");
      // Update the global user data store using the found record's timestamp
      if (globalThis.__userDataStore && globalThis.__userDataStore.length > 0 && targetRecord) {
        const actualSavedAt = targetRecord.savedAt; // Use the actual record's timestamp
        const targetIndex = globalThis.__userDataStore.findIndex(item => item.id === id && item.savedAt === actualSavedAt);
        
        if (targetIndex !== -1) {
          globalThis.__userDataStore[targetIndex] = { ...globalThis.__userDataStore[targetIndex], ...updates };
          console.log("Updated global user data record:", globalThis.__userDataStore[targetIndex]);
          return globalThis.__userDataStore[targetIndex];
        } else {
          console.log("Record not found in global user data store with timestamp:", actualSavedAt);
          return null;
        }
      } else {
        console.log("No global user data store available or no target record found");
        return null;
      }
    }
  } catch (error) {
    console.error("Database error updating specific row:", error);
    console.log("Fallback: updating global user data store");
    
    // Update the global user data store
    if (globalThis.__userDataStore && globalThis.__userDataStore.length > 0) {
      const targetIndex = globalThis.__userDataStore.findIndex(item => item.id === id && item.savedAt === savedAt);
      
      if (targetIndex !== -1) {
        globalThis.__userDataStore[targetIndex] = { ...globalThis.__userDataStore[targetIndex], ...updates };
        console.log("Updated global user data record:", globalThis.__userDataStore[targetIndex]);
        return globalThis.__userDataStore[targetIndex];
      } else {
        console.log("Record not found in global user data store");
        return null;
      }
    } else {
      console.log("No global user data store available");
      return null;
    }
  }
}

export async function updateRow(id: string, updates: Partial<DataRow>) {
  try {
    console.log("Updating row in database:", id, updates);
    
    // Find the most recent item with this ID (any status)
    const submissions = await DatabaseService.getSubmissions({ 
      limit: 100 // Get recent submissions to find the right one
    });
    
    let mostRecentSubmission = null;
    let mostRecentTime = null;
    
    for (const submission of submissions) {
      if (submission.id === id) {
        const submissionTime = new Date(submission.saved_at);
        if (!mostRecentTime || submissionTime > mostRecentTime) {
          mostRecentSubmission = submission;
          mostRecentTime = submissionTime;
        }
      }
    }
    
    if (mostRecentSubmission) {
      const dbUpdates: Partial<DatabaseSubmission> = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.reviewerMessage) dbUpdates.reviewer_message = updates.reviewerMessage;
      if (updates.approverMessage) dbUpdates.approver_message = updates.approverMessage;
      if (updates.value) dbUpdates.value = updates.value;
      if (updates.unit) dbUpdates.unit = updates.unit;
      if (updates.frequency) dbUpdates.frequency = updates.frequency;
      if (updates.responsible) dbUpdates.responsible = updates.responsible;
      if (updates.disaggregation) dbUpdates.disaggregation = updates.disaggregation;
      if (updates.notes) dbUpdates.notes = updates.notes;
      if (updates.savedAt) dbUpdates.saved_at = updates.savedAt;
      
      const result = await DatabaseService.updateSubmission(
        `${mostRecentSubmission.id}`, 
        dbUpdates
      );
      console.log("Updated row in database:", result.id, "to status:", updates.status);
      return result;
    } else {
      console.log("No submitted row found for ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Database error updating row:", error);
    console.log("Fallback: updating stored user data");
    
    // Update the stored user data
    if (!globalThis.__userDataStore) {
      globalThis.__userDataStore = [];
    }
    
    const targetIndex = globalThis.__userDataStore.findIndex(item => item.id === id);
    
    if (targetIndex !== -1) {
      // Update existing record
      globalThis.__userDataStore[targetIndex] = { ...globalThis.__userDataStore[targetIndex], ...updates };
      console.log("Updated stored user record:", globalThis.__userDataStore[targetIndex]);
      return globalThis.__userDataStore[targetIndex];
    } else {
      // Create new record if it doesn't exist
      console.log("Record not found in stored data, creating new record:", id);
      const newRecord = {
        id: id,
        section: updates.section || "Fisheries Management",
        level: updates.level || "Output", 
        label: updates.label || "New Submission",
        value: updates.value || "0",
        unit: updates.unit || "Count",
        frequency: updates.frequency || "Quarterly",
        period: updates.period || "2025 Q1",
        year: updates.year || "2025",
        quarter: updates.quarter || "Q1",
        responsible: updates.responsible || "User",
        disaggregation: updates.disaggregation || "Default",
        notes: updates.notes || "",
        status: updates.status || "draft",
        savedAt: updates.savedAt || new Date().toISOString(),
        submitterMessage: updates.submitterMessage || "",
        reviewerMessage: updates.reviewerMessage || "",
        approverMessage: updates.approverMessage || "",
        user: updates.user || "submitter@submit.com"
      };
      globalThis.__userDataStore.push(newRecord);
      console.log("Created new stored user record:", newRecord);
      return newRecord;
    }
  }
}

export async function getRowById(id: string): Promise<DataRow | undefined> {
  try {
    const submissions = await DatabaseService.getSubmissions();
    
    // Find the most recent item with this ID (any status)
    let mostRecentSubmission = null;
    let mostRecentTime = null;
    
    for (const submission of submissions) {
      if (submission.id === id) {
        const submissionTime = new Date(submission.saved_at);
        if (!mostRecentTime || submissionTime > mostRecentTime) {
          mostRecentSubmission = submission;
          mostRecentTime = submissionTime;
        }
      }
    }
    
    if (mostRecentSubmission) {
      return dbToApp(mostRecentSubmission);
    }
    
    // Fallback to any submission with this ID
    const anySubmission = submissions.find(s => s.id === id);
    return anySubmission ? dbToApp(anySubmission) : undefined;
  } catch (error) {
    console.error("Database error getting row by ID:", error);
    console.log("Fallback: searching stored user data for ID:", id);
    
    // Use the global user data store instead of sample data
    if (globalThis.__userDataStore && globalThis.__userDataStore.length > 0) {
      const foundItem = globalThis.__userDataStore.find(item => item.id === id);
      if (foundItem) {
        console.log("Found item in global user data store:", foundItem.id);
        return foundItem;
      }
    }
    
    console.log("No item found with ID:", id);
    return undefined;
  }
}

export async function getRowsByStatus(status: string): Promise<DataRow[]> {
  try {
    const dbRows = await DatabaseService.getSubmissions({ status });
    return dbRows.map(dbToApp);
  } catch (error) {
    console.error("Database error getting rows by status:", error);
    return [];
  }
}

export async function deleteRow(id: string, savedAt: string): Promise<boolean> {
  try {
    console.log(`Deleting row: ${id} saved at ${savedAt}`);
    await DatabaseService.deleteSubmission(id, savedAt);
    console.log(`Successfully deleted row: ${id}`);
    return true;
  } catch (error) {
    console.error("Database error deleting row:", error);
    console.log("Fallback: simulating successful delete until database is configured");
    // Simulate successful delete for development
    return true;
  }
}

export async function getRowsByUser(user: string): Promise<DataRow[]> {
  try {
    const dbRows = await DatabaseService.getSubmissions({ user_email: user });
    return dbRows.map(dbToApp);
  } catch (error) {
    console.error("Database error getting rows by user:", error);
    return [];
  }
}

export async function clearData() {
  console.log("Clear data not implemented for database - use admin panel");
}

// Force refresh sample data with correct user format
export function forceRefreshSampleData() {
  console.log('🔄 Force refreshing sample data...');
  globalThis.__sampleDataStore = undefined;
  
  // Also clear any cached data in the global state
  if (typeof global !== 'undefined') {
    (global as any).__sampleDataStore = undefined;
  }
  
  // Force clear any cached data in the global state
  if (typeof globalThis !== 'undefined') {
    globalThis.__sampleDataStore = undefined;
  }
  
  console.log('✅ All sample data cleared - returning empty array');
  return [];
}

// User management functions
export async function createUser(userData: {
  email: string;
  role: 'submitter' | 'reviewer' | 'approver' | 'admin';
  fullName: string;
}) {
  try {
    const user = await DatabaseService.createUser({
      email: userData.email,
      role: userData.role,
      full_name: userData.fullName,
      is_active: true,
      status: 'approved'
    });
    console.log("Created user:", user.email);
    return user;
  } catch (error) {
    console.error("Database error creating user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await DatabaseService.getUserByEmail(email);
    return user;
  } catch (error) {
    console.error("Database error getting user:", error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    const users = await DatabaseService.getUsers();
    return users;
  } catch (error) {
    console.error("Database error getting users:", error);
    return [];
  }
}


