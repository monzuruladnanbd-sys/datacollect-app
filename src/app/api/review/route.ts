import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import ExcelJS from "exceljs";
import path from "path";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user || user.role !== "reviewer") return NextResponse.json({ ok: false }, { status: 403 });
  
  const body = await req.json();
  const { id, decision, note, action, data } = body;
  
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
    
    if (action === "update" && data) {
      // Update existing row data
      for (let i = 2; i <= ws.rowCount; i++) {
        const row = ws.getRow(i);
        if (row.getCell(1).value?.toString() === id) {
          // Update the row with new data
          row.getCell(5).value = data.value || row.getCell(5).value; // Value
          row.getCell(6).value = data.unit || row.getCell(6).value; // Unit
          row.getCell(7).value = data.frequency || row.getCell(7).value; // Frequency
          row.getCell(8).value = data.period || row.getCell(8).value; // Period
          row.getCell(11).value = data.responsible || row.getCell(11).value; // Responsible
          row.getCell(12).value = data.disaggregation || row.getCell(12).value; // Disaggregation
          row.getCell(13).value = data.notes || row.getCell(13).value; // Notes
          row.getCell(15).value = new Date().toISOString(); // Updated timestamp
          break;
        }
      }
    } else if (decision && ["reviewed", "rejected"].includes(decision)) {
      // Find the most recent submission with this ID and status "submitted"
      let mostRecentRow = null;
      let mostRecentTime = null;
      
      for (let i = 2; i <= ws.rowCount; i++) {
        const row = ws.getRow(i);
        const rowId = row.getCell(1).value?.toString();
        const rowStatus = row.getCell(14).value?.toString();
        const rowTime = row.getCell(15).value?.toString();
        
        if (rowId === id && rowStatus === "submitted" && rowTime) {
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
      mostRecentRow.getCell(17).value = note || mostRecentRow.getCell(17).value; // Update reviewer message
    } else {
        return NextResponse.json({ ok: false, error: "No submitted entry found for this indicator" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
    
    await wb.xlsx.writeFile(file);
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update data" }, { status: 500 });
  }
}


