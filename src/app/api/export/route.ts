import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
export async function GET() {
  try {
    const file = path.join(process.cwd(), "data", "submissions.xlsx");
    const buf = await fs.readFile(file);
    return new NextResponse(buf as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="submissions.xlsx"',
      },
    });
  } catch {
    return NextResponse.json({ ok:false, message:"No data yet" }, { status:404 });
  }
}
