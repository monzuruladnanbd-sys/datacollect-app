import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateRow, getRowById } from "@/lib/storage";
import { RoundRobinService } from "@/lib/round-robin";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user || user.role !== "reviewer") return NextResponse.json({ ok: false }, { status: 403 });
  
  const body = await req.json();
  const { id, decision, note, action, data } = body;
  
  try {
    if (action === "update" && data) {
      // Update the row data in storage
      await updateRow(id, {
        value: data.value?.toString() || "",
        unit: data.unit || "",
        frequency: data.frequency || "",
        responsible: data.responsible || "",
        disaggregation: data.disaggregation || "",
        notes: data.notes || "",
        savedAt: new Date().toISOString(),
      });
      
      console.log(`Updated row ${id} with new data`);
      return NextResponse.json({ ok: true, message: "Data updated successfully" });
      
    } else if (decision && ["reviewed", "rejected"].includes(decision)) {
      // Handle review decision - find the specific submitted record
      console.log("Review decision for ID:", id, "decision:", decision);
      
      // Get all records to find submitted ones with this ID
      const { getRows } = await import("@/lib/storage");
      const allRows = await getRows();
      const submittedItem = allRows.find(row => row.id === id && row.status === "submitted");
      
      if (!submittedItem) {
        console.log("No submitted item found for ID:", id);
        console.log("Available items for this ID:", allRows.filter(row => row.id === id));
        return NextResponse.json({ ok: false, error: "No submitted entry found for this indicator" }, { status: 404 });
      }
      
      console.log("Found submitted item:", submittedItem);
      
      // If approving, assign an approver using round-robin
      let assignedApprover = null;
      if (decision === "reviewed") {
        console.log('🔄 Review approved, assigning approver...');
        assignedApprover = await RoundRobinService.getNextApprover();
        
        if (assignedApprover) {
          console.log('✅ Assigned approver:', assignedApprover);
        } else {
          console.log('⚠️ No approver available for assignment');
        }
      }
      
      // Update this specific record using the database with user tracking
      const { updateRow } = await import("@/lib/storage");
      const currentTimestamp = new Date().toISOString();
      const updateData: any = {
        status: decision,
        reviewerMessage: note || "",
        savedAt: currentTimestamp,
        assignedApprover: assignedApprover,
      };

      // Track who performed the review action
      if (decision === "reviewed") {
        updateData.reviewedBy = user.email;
        updateData.reviewedAt = currentTimestamp;
      } else if (decision === "rejected") {
        updateData.rejectedBy = user.email;
        updateData.rejectedAt = currentTimestamp;
      }

      await updateRow(submittedItem.id, updateData);
      
      console.log("Updated record in database:", submittedItem.id);
      
      console.log(`Updated row ${id} status to: ${decision}`);
      
      return NextResponse.json({ 
        ok: true, 
        message: `Submission ${decision} successfully with message: "${note}"` 
      });
    } else {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
    
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update data" }, { status: 500 });
  }
}


