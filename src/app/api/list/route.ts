import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import ExcelJS from "exceljs";
import path from "path";

export async function GET(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ ok:false }, { status:401 });
  
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "submitted";
  const allStatuses = url.searchParams.get("all") === "true";
  
  try {
    const file = path.join(process.cwd(), "data", "submissions.xlsx");
    const wb = new ExcelJS.Workbook();
    
    try {
      await wb.xlsx.readFile(file);
    } catch {
      return NextResponse.json({ ok: true, items: [] });
    }
    
    const ws = wb.getWorksheet("Entries");
    if (!ws || ws.rowCount <= 1) {
      return NextResponse.json({ ok: true, items: [] });
    }
    
    const allItems: any[] = [];
    
    // Read all rows except header
    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i);
      const rowData = {
        id: row.getCell(1).value?.toString() ?? "",
        section: row.getCell(2).value?.toString() ?? "",
        level: row.getCell(3).value?.toString() ?? "",
        label: row.getCell(4).value?.toString() ?? "",
        value: row.getCell(5).value?.toString() ?? "",
        unit: row.getCell(6).value?.toString() ?? "",
        frequency: row.getCell(7).value?.toString() ?? "",
        period: row.getCell(8).value?.toString() ?? "",
        year: row.getCell(9).value?.toString() ?? "",
        quarter: row.getCell(10).value?.toString() ?? "",
        responsible: row.getCell(11).value?.toString() ?? "",
        disaggregation: row.getCell(12).value?.toString() ?? "",
        notes: row.getCell(13).value?.toString() ?? "",
        status: row.getCell(14).value?.toString() ?? "",
        savedAt: row.getCell(15).value?.toString() ?? "",
        submitterMessage: row.getCell(16).value?.toString() ?? "",
        reviewerMessage: row.getCell(17).value?.toString() ?? "",
        approverMessage: row.getCell(18).value?.toString() ?? "",
        rowIndex: i, // Keep track of original row index
      };
      
      // Only include rows that have actual data (not empty/blank submissions)
      const hasData = rowData.value && rowData.value.trim() !== "" && 
                     rowData.savedAt && rowData.savedAt.trim() !== "";
      
      // Filter by status, user role, and data presence
      if (hasData) {
        const statusMatch = allStatuses || rowData.status === status;
        const roleMatch = 
          (user.role === "submitter" && rowData.savedAt) ||
          (user.role === "reviewer" && (allStatuses || status === "submitted" || rowData.status === "reviewed" || rowData.status === "rejected")) ||
          (user.role === "approver" && (allStatuses || status === "reviewed" || status === "submitted"));
        
        if (statusMatch && roleMatch) {
          allItems.push(rowData);
        }
      }
    }
    
    // Group by indicator ID and get the most recent submission for each
    const itemsMap = new Map<string, any>();
    
    for (const item of allItems) {
      const existing = itemsMap.get(item.id);
      if (!existing || new Date(item.savedAt) > new Date(existing.savedAt)) {
        itemsMap.set(item.id, item);
      }
    }
    
    const items = Array.from(itemsMap.values());
    
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("List API error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load data" }, { status: 500 });
  }
}
