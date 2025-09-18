import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/xl";
// If you don't use sessions, remove these two lines:
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { indicatorId: string } }) {
  try {
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

    // optional user
    let user: string | null = null;
    try {
      const session = await getIronSession<any>(req as any, {} as any, sessionOptions);
      user = session?.user?.email ?? null;
    } catch {}

    await appendRow({
      indicatorId: params.indicatorId,
      status,
      value,
      unit,
      frequency,
      period,
      responsible,
      disaggregation,
      notes,
      user,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok:false, error: e?.message ?? "Failed to save" },
      { status: 500 }
    );
  }
}
