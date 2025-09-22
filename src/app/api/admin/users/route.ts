import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { DatabaseService } from "@/lib/supabase";
import { getAllUsers, getUserStats } from "@/lib/users";
import { createUser } from "@/lib/database";

// GET /api/admin/users - Get all users and stats
export async function GET() {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Access denied" }, { status: 403 });
  }

  try {
    const users = await getAllUsers();
    const stats = await getUserStats();

    const availableRoles = ['submitter', 'reviewer', 'approver', 'admin'];

    return NextResponse.json({
      ok: true,
      users: users || [],
      stats: {
        total: stats.totalUsers,
        active: stats.activeUsers,
        submitters: stats.submitters,
        reviewers: stats.reviewers,
        approvers: stats.approvers,
        admins: 1, // Only one admin
      },
      availableRoles,
    });
  } catch (error) {
    console.error("Failed to get users:", error);
    return NextResponse.json({ ok: false, message: "Failed to load users" }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Access denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, role, department, phone, password } = body;

    // Validate required fields
    if (!name || !email || !role || !password) {
      return NextResponse.json({ 
        ok: false, 
        message: "Name, email, role, and password are required" 
      }, { status: 400 });
    }

    // TODO: Add role limit checking if needed

    // Create user
    const newUser = await createUser({
      fullName: name,
      email,
      role: role as 'submitter' | 'reviewer' | 'approver' | 'admin',
    });

    return NextResponse.json({
      ok: true,
      user: newUser,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ ok: false, message: "Failed to create user" }, { status: 500 });
  }
}
