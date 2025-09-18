import ExcelJS from "exceljs";

// In-memory storage for serverless environment
let memoryStore: { [key: string]: ExcelJS.Workbook } = {};

export async function ensureWorkbook() {
  const wb = new ExcelJS.Workbook();
  return wb;
}

export function sheetName(id: string) {
  return id.slice(0,31).replace(/[\\/:*?[\]]/g,"_");
}

export async function appendRow(payload: {
  indicatorId: string;
  status: "draft"|"submitted";
  value: number | boolean | null;
  unit?: string;
  frequency?: string;
  period?: string;
  responsible?: string[];
  disaggregation?: string[];
  notes?: string;
  user?: string|null;
  submitterMessage?: string;
  reviewerMessage?: string;
  approverMessage?: string;
}) {
  const wb = await ensureWorkbook();
  const wsName = sheetName(payload.indicatorId);
  let ws = wb.getWorksheet(wsName);
  if (!ws) {
    ws = wb.addWorksheet(wsName);
    ws.columns = [
      { header: "timestamp", key:"ts", width:22 },
      { header: "status", key:"status", width:12 },
      { header: "user", key:"user", width:28 },
      { header: "value", key:"value", width:14 },
      { header: "unit", key:"unit", width:16 },
      { header: "frequency", key:"frequency", width:16 },
      { header: "period", key:"period", width:16 },
      { header: "responsible", key:"resp", width:60 },
      { header: "disaggregation", key:"disagg", width:60 },
      { header: "notes", key:"notes", width:60 },
      { header: "submitter_message", key:"submitter_msg", width:100 },
      { header: "reviewer_message", key:"reviewer_msg", width:100 },
      { header: "approver_message", key:"approver_msg", width:100 },
    ];
  }
  ws.addRow({
    ts: new Date().toISOString(),
    status: payload.status,
    user: payload.user ?? "",
    value: typeof payload.value === "boolean" ? (payload.value ? "Yes" : "No") : payload.value ?? "",
    unit: payload.unit ?? "",
    frequency: payload.frequency ?? "",
    period: payload.period ?? "",
    resp: (payload.responsible ?? []).join("|"),
    disagg: (payload.disaggregation ?? []).join("|"),
    notes: payload.notes ?? "",
    submitter_msg: payload.submitterMessage ?? "",
    reviewer_msg: payload.reviewerMessage ?? "",
    approver_msg: payload.approverMessage ?? "",
  });
  
  // Store in memory for this session
  memoryStore[payload.indicatorId] = wb;
}

export async function getWorkbookBuffer(indicatorId: string): Promise<Buffer> {
  const wb = memoryStore[indicatorId] || await ensureWorkbook();
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function getAllWorkbooks(): Promise<{ [key: string]: ExcelJS.Workbook }> {
  return memoryStore;
}