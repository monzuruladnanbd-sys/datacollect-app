import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, updateUser, deactivateUser } from "@/lib/users";

// PUT /api/admin/users/[id] - Update user
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Access denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, role, department, phone, password } = body;

    const existingUser = getUserById(params.id);
    if (!existingUser) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      department,
      phone,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.passwordHash = password; // In production, hash this
    }

    const updatedUser = updateUser(params.id, updateData);
    if (!updatedUser) {
      return NextResponse.json({ ok: false, message: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ ok: false, message: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Deactivate user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Access denied" }, { status: 403 });
  }

  try {
    const existingUser = getUserById(params.id);
    if (!existingUser) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    // Prevent deactivating yourself
    if (existingUser.id === user.id) {
      return NextResponse.json({ 
        ok: false, 
        message: "Cannot deactivate your own account" 
      }, { status: 400 });
    }

    const success = deactivateUser(params.id);
    if (!success) {
      return NextResponse.json({ ok: false, message: "Failed to deactivate user" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Failed to deactivate user:", error);
    return NextResponse.json({ ok: false, message: "Failed to deactivate user" }, { status: 500 });
  }
}
