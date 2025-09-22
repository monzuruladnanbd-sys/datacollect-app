import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateRow, getRowById, updateSpecificRow, type DataRow } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "submitter") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      indicatorId, 
      status, 
      submitterMessage,
      value,
      unit,
      frequency,
      period,
      responsible,
      disaggregation
    } = body;

    console.log("Update draft request:", { 
      indicatorId, 
      status, 
      submitterMessage,
      value,
      unit,
      frequency,
      period,
      responsible,
      disaggregation
    });

    if (!indicatorId || !status) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    // Find the existing draft record
    const existingRow = await getRowById(indicatorId);
    if (!existingRow) {
      return NextResponse.json({ ok: false, error: "Draft not found" }, { status: 404 });
    }

    console.log("Found existing row:", existingRow);

    // Update the status and message, plus any field values that were provided
    const currentTimestamp = new Date().toISOString();
    const updates: Partial<DataRow> = {
      status: status,
      submitterMessage: submitterMessage || "",
      savedAt: currentTimestamp,
      // Update field values if they were provided
      ...(value !== undefined && { value }),
      ...(unit !== undefined && { unit }),
      ...(frequency !== undefined && { frequency }),
      ...(period !== undefined && { period }),
      ...(responsible !== undefined && { responsible }),
      ...(disaggregation !== undefined && { disaggregation }),
      // Track user who made the edit
      editedBy: user.email,
      editedAt: currentTimestamp,
      // Track submission if status changed to submitted
      ...(status === "submitted" && {
        submittedBy: user.email,
        submittedAt: currentTimestamp
      })
    };

    console.log("Updating row with:", updates);

    // Update the specific row using savedAt to ensure we update the right record
    const { updateSpecificRow } = await import("@/lib/storage");
    const updateResult = await updateSpecificRow(indicatorId, existingRow.savedAt, updates);
    
    if (!updateResult) {
      return NextResponse.json({ ok: false, error: "Failed to update record" }, { status: 500 });
    }

    console.log("Row updated successfully");

    return NextResponse.json({ ok: true, data: updateResult });
  } catch (error) {
    console.error("Update draft error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}