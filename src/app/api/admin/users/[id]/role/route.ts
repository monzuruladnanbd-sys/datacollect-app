import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { changeUserRole } from "@/lib/users";

// PUT /api/admin/users/[id]/role - Change user role
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Access denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ 
        ok: false, 
        message: "Role is required" 
      }, { status: 400 });
    }

    // Validate role
    const validRoles = ["submitter", "reviewer", "approver"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        ok: false, 
        message: "Invalid role" 
      }, { status: 400 });
    }

    // Change user role
    const result = changeUserRole(params.id, role);

    if (result.success) {
      return NextResponse.json({
        ok: true,
        message: result.message,
      });
    } else {
      return NextResponse.json({ 
        ok: false, 
        message: result.message 
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Failed to change user role:", error);
    return NextResponse.json({ ok: false, message: "Failed to change user role" }, { status: 500 });
  }
}

