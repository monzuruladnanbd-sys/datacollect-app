import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user || user.role!=="submitter") return NextResponse.json({ ok:false, message:"Forbidden" }, { status:403 });
  
  const body = await req.json();
  const { indicatorId, unit, frequency, responsible, disaggregation, action } = body || {};
  if (!indicatorId) return NextResponse.json({ ok:false, message:"indicatorId required" }, { status:400 });
  
  // Forward to the indicator-specific API
  const response = await fetch(`${req.url.replace('/api/submit', `/api/indicator/${indicatorId}`)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      unit,
      frequency,
      responsible: Array.isArray(responsible) ? responsible : [],
      disaggregation: Array.isArray(disaggregation) ? disaggregation : [],
      status: action === "submit" ? "submitted" : "draft"
    })
  });
  
  const result = await response.json();
  return NextResponse.json(result);
}
