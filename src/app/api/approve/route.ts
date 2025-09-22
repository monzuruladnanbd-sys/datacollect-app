import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRows } from "@/lib/storage";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user || user.role !== "approver") return NextResponse.json({ ok: false }, { status: 403 });
  
  const body = await req.json();
  const { id, decision, note } = body;
  
  console.log("Approve decision for ID:", id, "decision:", decision);
  
  if (!id || !["approved", "rejected"].includes(decision)) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  
  try {
    // Get all records to find reviewed ones with this ID
    const allRows = await getRows();
    const reviewedItem = allRows.find(row => row.id === id && row.status === "reviewed");
    
    if (!reviewedItem) {
      console.log("No reviewed item found for ID:", id);
      console.log("Available items for this ID:", allRows.filter(row => row.id === id));
      return NextResponse.json({ ok: false, error: "No reviewed entry found for this indicator" }, { status: 404 });
    }
    
    console.log("Found reviewed item:", reviewedItem);
    
    // Update this specific record using the database with user tracking
    const { updateRow } = await import("@/lib/storage");
    const currentTimestamp = new Date().toISOString();
    const updateData: any = {
      status: decision,
      approverMessage: note || "",
      savedAt: currentTimestamp,
    };

    // Track who performed the approval action
    if (decision === "approved") {
      updateData.approvedBy = user.email;
      updateData.approvedAt = currentTimestamp;
    } else if (decision === "rejected") {
      updateData.rejectedBy = user.email;
      updateData.rejectedAt = currentTimestamp;
    }

    await updateRow(reviewedItem.id, updateData);
    
    console.log("Updated record in database:", reviewedItem.id);
    console.log("New status:", decision);
    
    return NextResponse.json({ 
      ok: true, 
      message: `Submission ${decision} successfully with message: "${note}"` 
    });
    
  } catch (error) {
    console.error("Approve API error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update data" }, { status: 500 });
  }
}


