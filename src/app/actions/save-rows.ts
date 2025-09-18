"use server";
import ExcelJS from "exceljs";
import path from "node:path";
import { promises as fs } from "node:fs";
import { s, a, yearFromPeriod, quarterFromPeriod } from "@/lib/safe";

type RowPayload = {
  id: string;
  section: string;
  level: "process" | "output" | "outcome";
  label: string;

  value: number | string | boolean | null;
  unit?: string;
  frequency?: string;
  period?: string;
  responsible?: string[];
  disaggregation?: string[];
  notes?: string;
  status: "draft" | "submitted";
};

export async function saveRows(rows: RowPayload[]) {
  try {
    const normalized = rows.map((r) => {
      try {
        const period = s(r.period);
        return {
          ...r,
          unit: s(r.unit),
          frequency: s(r.frequency),
          period,
          notes: s(r.notes),
          responsible: a(r.responsible),
          disaggregation: a(r.disaggregation),
          _year: yearFromPeriod(period),
          _quarter: quarterFromPeriod(period),
        };
      } catch (err) {
        console.error("Error normalizing row:", r, err);
        throw new Error(`Error processing row ${r.id}: ${err}`);
      }
    });

    const file = path.join(process.cwd(), "data", "submissions.xlsx");
    const wb = new ExcelJS.Workbook();

    try {
      await wb.xlsx.readFile(file);
    } catch {
      const ws = wb.addWorksheet("Entries");
      ws.addRow([
        "ID","Section","Level","Label","Value","Unit","Frequency",
        "Period","Year","Quarter","Responsible","Disaggregation",
        "Notes","Status","SavedAt",
      ]);
    }

    const ws = wb.getWorksheet("Entries") ?? wb.addWorksheet("Entries");
    const now = new Date().toISOString();

    for (const r of normalized) {
      ws.addRow([
        r.id,
        r.section,
        r.level,
        r.label,
        typeof r.value === "boolean" ? (r.value ? "Yes" : "No") : r.value ?? "",
        r.unit,
        r.frequency,
        r.period,
        r._year,
        r._quarter,
        r.responsible.join(", "),
        r.disaggregation.join(", "),
        r.notes,
        r.status,
        now,
      ]);
    }

    await fs.mkdir(path.dirname(file), { recursive: true });
    await wb.xlsx.writeFile(file);

    return { ok: true };
  } catch (err: any) {
    console.error("saveRows error:", err);
    return { ok: false, error: err?.message ?? "Unknown error" };
  }
}
