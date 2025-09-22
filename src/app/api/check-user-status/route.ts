import { NextResponse } from "next/server";
import { LocalDatabaseService } from "@/lib/local-database";

// GET /api/check-user-status - Check if a user is approved
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user from local database
    const user = await LocalDatabaseService.getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json({
        found: false,
        approved: false,
        rejected: false,
        pending: false
      });
    }

    const status = (user as any).status || 'pending';
    
    return NextResponse.json({
      found: true,
      approved: user.is_active && status === 'approved',
      rejected: status === 'rejected',
      pending: status === 'pending',
      role: user.role,
      status: status
    });

  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



