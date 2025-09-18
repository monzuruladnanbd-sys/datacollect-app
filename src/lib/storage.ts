// Simple file-based storage for Vercel deployment
import { promises as fs } from 'fs';
import path from 'path';

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

const DATA_FILE = path.join(process.cwd(), 'data.json');

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }
}

async function readData(): Promise<DataRow[]> {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeData(data: DataRow[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function addRow(row: DataRow) {
  const data = await readData();
  data.push(row);
  await writeData(data);
}

export async function getRows(): Promise<DataRow[]> {
  return await readData();
}

export async function updateRow(id: string, updates: Partial<DataRow>) {
  const data = await readData();
  const index = data.findIndex(row => row.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...updates };
    await writeData(data);
  }
}

export async function getRowById(id: string): Promise<DataRow | undefined> {
  const data = await readData();
  return data.find(row => row.id === id);
}

export async function getRowsByStatus(status: string): Promise<DataRow[]> {
  const data = await readData();
  return data.filter(row => row.status === status);
}

export async function getRowsByUser(user: string): Promise<DataRow[]> {
  const data = await readData();
  return data.filter(row => row.user === user);
}

export async function clearData() {
  await writeData([]);
}