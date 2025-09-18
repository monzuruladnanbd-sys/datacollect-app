import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { 
  getAllUsers, 
  getUserStats, 
  createUser, 
  canAddUser,
  getAvailableRoles 
} from "@/lib/users";

// GET /api/admin/users - Get all users and stats
export async function GET() {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Access denied" }, { status: 403 });
  }

  try {
    const users = getAllUsers();
    const stats = getUserStats();
    const availableRoles = getAvailableRoles();

    return NextResponse.json({
      ok: true,
      users,
      stats,
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

    // Check if role can be added
    if (!canAddUser(role)) {
      return NextResponse.json({ 
        ok: false, 
        message: `Cannot add more ${role}s. Limit reached.` 
      }, { status: 400 });
    }

    // Create user
    const newUser = createUser({
      name,
      email,
      role,
      department,
      phone,
      password,
      isActive: true,
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
