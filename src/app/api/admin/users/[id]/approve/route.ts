import { NextResponse } from "next/server";
import { approveUser } from "@/lib/users";
import { getSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🚀 Approve API endpoint called');
    
    // Check if user is admin
    const session = await getSession();
    console.log('🔍 Session check:', { hasUser: !!session.user, role: session.user?.role });
    
    if (!session.user || session.user.role !== 'admin') {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    console.log('📝 Approving user with ID:', id);
    
    const result = await approveUser(id);
    console.log('📝 Approval result:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error approving user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

