import { NextRequest, NextResponse } from "next/server";
import { addRow } from "@/lib/storage";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { indicatorId: string } }) {
  try {
    const { user } = await getSession();
    if (!user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const status = body?.status === "draft" ? "draft" : "submitted";
    const unit = body?.unit?.toString?.() ?? "";
    const frequency = body?.frequency?.toString?.() ?? "";
    const period = body?.period?.toString?.() ?? "";
    const responsible: string[] = Array.isArray(body?.responsible) ? body.responsible : [];
    const disaggregation: string[] = Array.isArray(body?.disaggregation) ? body.disaggregation : [];
    const notes = body?.notes?.toString?.() ?? "";

    // value: number or boolean (for yes/no indicators)
    let value: number | boolean | null = null;
    if (typeof body?.value === "boolean") value = body.value;
    else if (body?.value !== undefined && body?.value !== null && body?.value !== "") {
      const n = Number(body.value);
      value = Number.isFinite(n) ? n : null;
    }

    // Create a data row
    const dataRow = {
      id: params.indicatorId,
      section: "Fisheries Management", // Default section
      level: "Project",
      label: `Indicator ${params.indicatorId}`,
      value: typeof value === "boolean" ? (value ? "Yes" : "No") : (value?.toString() ?? ""),
      unit: unit,
      frequency: frequency,
      period: period,
      year: new Date().getFullYear().toString(),
      quarter: "Q1", // Default quarter
      responsible: responsible.join(", "),
      disaggregation: disaggregation.join(", "),
      notes: notes,
      status: status,
      savedAt: new Date().toISOString(),
      submitterMessage: "",
      reviewerMessage: "",
      approverMessage: "",
      user: user.email,
    };

    await addRow(dataRow);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to save" },
      { status: 500 }
    );
  }
}