import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteRow, getRows } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const { user } = await getSession();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, savedAt } = body;

    console.log("Delete request:", { id, savedAt, userRole: user.role });

    if (!id || !savedAt) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    // Get all records to find the specific record
    const allRows = await getRows();
    const targetRecord = allRows.find(row => row.id === id && row.savedAt === savedAt);

    if (!targetRecord) {
      return NextResponse.json({ ok: false, error: "Record not found" }, { status: 404 });
    }

    console.log("Found record to delete:", { id, status: targetRecord.status, userRole: user.role });

    // Role-based permission checks
    const canDelete = checkDeletePermission(user.role, targetRecord.status);
    
    if (!canDelete.allowed) {
      return NextResponse.json({ 
        ok: false, 
        error: canDelete.reason 
      }, { status: 403 });
    }

    // Mark record as deleted instead of removing it with user tracking
    const { updateSpecificRow } = await import("@/lib/storage");
    const currentTimestamp = new Date().toISOString();
    const updateSuccess = await updateSpecificRow(id, savedAt, {
      status: "deleted",
      savedAt: currentTimestamp,
      approverMessage: targetRecord.approverMessage || `Deleted by ${user.role}`,
      deletedBy: user.email,
      deletedAt: currentTimestamp
    });
    
    if (updateSuccess) {
      console.log("Successfully marked record as deleted:", id);
      return NextResponse.json({ 
        ok: true, 
        message: `Record moved to deleted successfully` 
      });
    } else {
      return NextResponse.json({ 
        ok: false, 
        error: "Failed to delete record" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Delete record error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// Role-based delete permission logic
function checkDeletePermission(userRole: string, recordStatus: string) {
  switch (userRole) {
    case 'submitter':
      // Submitters can only delete unsubmitted drafts
      if (recordStatus === 'draft') {
        return { allowed: true, reason: '' };
      }
      return { 
        allowed: false, 
        reason: 'Submitters can only delete unsubmitted draft records' 
      };

    case 'reviewer':
      // Reviewers can only delete submitted (unreviewed) records, NOT reviewed data
      if (recordStatus === 'submitted') {
        return { allowed: true, reason: '' };
      }
      return { 
        allowed: false, 
        reason: 'Reviewers can only delete submitted (unreviewed) records, not reviewed data' 
      };

    case 'approver':
      // Approvers can delete any reviewed record
      if (['reviewed', 'approved', 'rejected'].includes(recordStatus)) {
        return { allowed: true, reason: '' };
      }
      return { 
        allowed: false, 
        reason: 'Approvers can only delete reviewed, approved, or rejected records' 
      };

    case 'admin':
      // Admins can delete anything
      return { allowed: true, reason: '' };

    default:
      return { 
        allowed: false, 
        reason: 'Invalid user role' 
      };
  }
}
