// Simple in-memory storage that persists during the function execution
// This works better with Vercel's serverless environment

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

// Global variable to store data during function execution
let dataStore: DataRow[] = [
  // Sample data for testing
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

export async function addRow(row: DataRow) {
  console.log("Adding row to storage:", row);
  dataStore.push(row);
  console.log("Added row:", row.id, "Total rows:", dataStore.length);
  console.log("Current dataStore:", dataStore);
}

export async function getRows(): Promise<DataRow[]> {
  console.log("Retrieved rows:", dataStore.length);
  return dataStore;
}

export async function updateRow(id: string, updates: Partial<DataRow>) {
  const index = dataStore.findIndex(row => row.id === id);
  if (index !== -1) {
    dataStore[index] = { ...dataStore[index], ...updates };
    console.log("Updated row:", id);
  }
}

export async function getRowById(id: string): Promise<DataRow | undefined> {
  return dataStore.find(row => row.id === id);
}

export async function getRowsByStatus(status: string): Promise<DataRow[]> {
  return dataStore.filter(row => row.status === status);
}

export async function getRowsByUser(user: string): Promise<DataRow[]> {
  return dataStore.filter(row => row.user === user);
}

export async function clearData() {
  dataStore = [];
  console.log("Cleared all data");
}