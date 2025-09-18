import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import ExcelJS from "exceljs";
import path from "path";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user || user.role !== "submitter") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
  
  const body = await req.json();
  const { indicatorId, status, submitterMessage, reviewerMessage, approverMessage } = body;
  
  if (!indicatorId || !status) {
    return NextResponse.json({ ok: false, error: "indicatorId and status required" }, { status: 400 });
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
    
    // Find the most recent draft with this indicator ID
    let mostRecentRow = null;
    let mostRecentTime = null;
    
    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i);
      const rowId = row.getCell(1).value?.toString();
      const rowStatus = row.getCell(14).value?.toString();
      const rowTime = row.getCell(15).value?.toString();
      
      if (rowId === indicatorId && rowStatus === "draft" && rowTime) {
        const rowDate = new Date(rowTime);
        if (!mostRecentTime || rowDate > mostRecentTime) {
          mostRecentRow = row;
          mostRecentTime = rowDate;
        }
      }
    }
    
    if (mostRecentRow) {
      mostRecentRow.getCell(13).value = mostRecentRow.getCell(13).value; // Keep existing notes
      mostRecentRow.getCell(14).value = status; // Update status
      mostRecentRow.getCell(15).value = new Date().toISOString(); // Update timestamp
      mostRecentRow.getCell(16).value = submitterMessage || mostRecentRow.getCell(16).value; // Update submitter message
      mostRecentRow.getCell(17).value = reviewerMessage || mostRecentRow.getCell(17).value; // Update reviewer message
      mostRecentRow.getCell(18).value = approverMessage || mostRecentRow.getCell(18).value; // Update approver message
    } else {
      return NextResponse.json({ ok: false, error: "No draft found for this indicator" }, { status: 404 });
    }
    
    await wb.xlsx.writeFile(file);
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Update draft API error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update draft" }, { status: 500 });
  }
}
