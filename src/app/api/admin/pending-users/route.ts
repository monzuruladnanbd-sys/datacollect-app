import { NextResponse } from "next/server";
import { getPendingUsers } from "@/lib/users";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    // Check if user is admin
    const session = await getSession();
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const pendingUsers = await getPendingUsers();
    
    console.log('🔍 Pending users API returning:', pendingUsers.length, 'users');
    console.log('📋 All pending users with details:', pendingUsers.map(u => ({ 
      id: u.id, 
      email: u.email, 
      name: u.name, 
      isActive: u.isActive,
      role: u.role 
    })));
    
    return NextResponse.json({
      success: true,
      users: pendingUsers
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}