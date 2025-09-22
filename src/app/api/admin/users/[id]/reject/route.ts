import { NextResponse } from "next/server";
import { rejectUser } from "@/lib/users";
import { getSession } from "@/lib/auth";

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
    const result = await rejectUser(id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error rejecting user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

