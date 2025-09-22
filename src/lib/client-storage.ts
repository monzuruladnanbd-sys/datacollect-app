// Client-side storage using localStorage for immediate functionality

interface DataRow {
  id: string;
  section: string;
  level: string;
  label: string;
  value: string;
  unit: string;
  frequency: string;
  period: string;
  year: string;
  quarter: string;
  responsible: string;
  disaggregation: string;
  notes: string;
  status: string;
  savedAt: string;
  submitterMessage: string;
  reviewerMessage: string;
  approverMessage: string;
  user: string;
}

const STORAGE_KEY = 'datacollect_submissions';

export function getStoredData(): DataRow[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  // Return empty array - no sample data to avoid user mismatches
  console.log('🔄 No localStorage data - starting with empty submissions');
  return [];
}

export function saveData(data: DataRow[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Data saved to localStorage:', data.length, 'items');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function addRow(row: DataRow): void {
  const currentData = getStoredData();
  currentData.push(row);
  saveData(currentData);
  console.log('Added row to localStorage:', row.id);
}








