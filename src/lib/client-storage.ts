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
  
  // Return sample data if nothing stored
  return [
    {
      id: "FM-P-001",
      section: "Fisheries Management",
      level: "Project",
      label: "At-sea patrol missions / vessel inspections",
      value: "5",
      unit: "missions",
      frequency: "Quarterly",
      period: "2024 Q1",
      year: "2024",
      quarter: "Q1",
      responsible: "Compliance Unit, PMU M&E Specialist",
      disaggregation: "EEZ, Territorial waters",
      notes: "Sample data for testing",
      status: "draft",
      savedAt: new Date().toISOString(),
      submitterMessage: "",
      reviewerMessage: "",
      approverMessage: "",
      user: "submitter@example.com"
    }
  ];
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
