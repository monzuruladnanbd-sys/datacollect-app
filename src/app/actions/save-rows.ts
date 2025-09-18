"use server";
import { addRow } from "@/lib/storage";
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

    const now = new Date().toISOString();

    for (const r of normalized) {
      await addRow({
        id: r.id,
        section: r.section,
        level: r.level,
        label: r.label,
        value: typeof r.value === "boolean" ? (r.value ? "Yes" : "No") : (r.value?.toString() ?? ""),
        unit: r.unit,
        frequency: r.frequency,
        period: r.period,
        year: r._year,
        quarter: r._quarter,
        responsible: r.responsible.join(", "),
        disaggregation: r.disaggregation.join(", "),
        notes: r.notes,
        status: r.status,
        savedAt: now,
        submitterMessage: "",
        reviewerMessage: "",
        approverMessage: "",
        user: "system", // Default user for server actions
      });
    }

    return { ok: true };
  } catch (err: any) {
    console.error("saveRows error:", err);
    return { ok: false, error: err?.message ?? "Unknown error" };
  }
}