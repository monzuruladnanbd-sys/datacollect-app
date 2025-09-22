import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { DatabaseService } from "@/lib/supabase";
import { deleteUser } from "@/lib/users";

// PUT /api/admin/users/[id] - Update user (status, etc.)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Access denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { is_active, role, full_name, organization, phone } = body;

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };
    if (is_active !== undefined) updates.is_active = is_active;
    if (role) updates.role = role;
    if (full_name) updates.full_name = full_name;
    if (organization !== undefined) updates.organization = organization;
    if (phone !== undefined) updates.phone = phone;

    // Update user in database using DatabaseService
    const data = await DatabaseService.updateUser(params.id, updates);

    return NextResponse.json({
      ok: true,
      message: "User updated successfully",
      user: data
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ ok: false, message: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('🗑️ DELETE API endpoint called for user ID:', params.id);
    
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      console.log('🗑️ Access denied - user not admin');
      return NextResponse.json({ ok: false, message: "Access denied" }, { status: 403 });
    }

    console.log('🗑️ Admin access confirmed, calling deleteUser...');
    const result = await deleteUser(params.id);
    console.log('🗑️ deleteUser result:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("🗑️ Failed to delete user:", error);
    return NextResponse.json({ success: false, message: "Failed to delete user" }, { status: 500 });
  }
}