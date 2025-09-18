import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import ExcelJS from "exceljs";
import path from "path";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user || user.role !== "approver") return NextResponse.json({ ok: false }, { status: 403 });
  
  const body = await req.json();
  const { id, decision, note } = body;
  
  if (!id || !["approved", "rejected"].includes(decision)) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  
  try {
    const file = path.join(process.cwd(), "data", "submissions.xlsx");
    const wb = new ExcelJS.Workbook();
    
    try {
      await wb.xlsx.readFile(file);
    } catch {
      return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });
    }
    
    const ws = wb.getWorksheet("Entries");
    if (!ws) {
      return NextResponse.json({ ok: false, error: "Entries sheet not found" }, { status: 404 });
    }
    
    // Find the most recent submission with this ID and status "reviewed"
    let mostRecentRow = null;
    let mostRecentTime = null;
    
    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i);
      const rowId = row.getCell(1).value?.toString();
      const rowStatus = row.getCell(14).value?.toString();
      const rowTime = row.getCell(15).value?.toString();
      
      if (rowId === id && rowStatus === "reviewed" && rowTime) {
        const rowDate = new Date(rowTime);
        if (!mostRecentTime || rowDate > mostRecentTime) {
          mostRecentRow = row;
          mostRecentTime = rowDate;
        }
      }
    }
    
    if (mostRecentRow) {
      mostRecentRow.getCell(14).value = decision; // Status
      mostRecentRow.getCell(15).value = new Date().toISOString(); // Updated timestamp
      mostRecentRow.getCell(18).value = note || mostRecentRow.getCell(18).value; // Update approver message
    } else {
      return NextResponse.json({ ok: false, error: "No reviewed entry found for this indicator" }, { status: 404 });
    }
    
    await wb.xlsx.writeFile(file);
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Approve API error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update data" }, { status: 500 });
  }
}


