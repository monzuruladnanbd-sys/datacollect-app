import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/users";

export async function GET() {
  try {
    const users = await getAllUsers();
    
    return NextResponse.json({
      success: true,
      users: users,
      count: users.length,
      message: `Found ${users.length} users in the system`
    });
  } catch (error) {
    console.error('Error fetching users for debug:', error);
    return NextResponse.json({
      success: false,
      users: [],
      count: 0,
      message: 'Error fetching users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
