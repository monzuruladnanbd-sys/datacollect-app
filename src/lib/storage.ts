// Database storage using Supabase for persistent, globally accessible data
// This provides proper persistence and scalability for production deployment

// Re-export the database functions to maintain compatibility with existing API calls
export {
  addRow,
  getRows,
  updateRow,
  updateSpecificRow,
  getRowById,
  getRowsByStatus,
  deleteRow,
  getRowsByUser,
  clearData,
  type DataRow
} from './database';