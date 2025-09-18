// Simple in-memory storage for serverless environment
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

// In-memory storage
let dataStore: DataRow[] = [];

export function addRow(row: DataRow) {
  dataStore.push(row);
}

export function getRows(): DataRow[] {
  return dataStore;
}

export function updateRow(id: string, updates: Partial<DataRow>) {
  const index = dataStore.findIndex(row => row.id === id);
  if (index !== -1) {
    dataStore[index] = { ...dataStore[index], ...updates };
  }
}

export function getRowById(id: string): DataRow | undefined {
  return dataStore.find(row => row.id === id);
}

export function getRowsByStatus(status: string): DataRow[] {
  return dataStore.filter(row => row.status === status);
}

export function getRowsByUser(user: string): DataRow[] {
  return dataStore.filter(row => row.user === user);
}

export function clearData() {
  dataStore = [];
}
