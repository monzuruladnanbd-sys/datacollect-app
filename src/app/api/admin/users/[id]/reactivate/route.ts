import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { LocalDatabaseService } from "@/lib/local-database";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const session = await getSession();
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Reactivate user by setting is_active to true
    await LocalDatabaseService.updateUser(id, { is_active: true });
    
    return NextResponse.json({
      success: true,
      message: "User reactivated successfully"
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
