import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { RoundRobinService } from "@/lib/round-robin";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await req.json();
    
    if (!role || !['reviewer', 'approver'].includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role. Must be "reviewer" or "approver"' 
      }, { status: 400 });
    }

    console.log(`🔄 Assigning next ${role}...`);

    let assignedUser: string | null = null;
    
    if (role === 'reviewer') {
      assignedUser = await RoundRobinService.getNextReviewer();
    } else if (role === 'approver') {
      assignedUser = await RoundRobinService.getNextApprover();
    }

    if (!assignedUser) {
      return NextResponse.json({ 
        success: false, 
        error: `No available ${role}s found` 
      }, { status: 404 });
    }

    console.log(`✅ Assigned ${role}:`, assignedUser);

    return NextResponse.json({ 
      success: true, 
      assignedUser,
      role,
      message: `Next ${role} assigned: ${assignedUser}` 
    });

  } catch (error) {
    console.error('Round-robin assignment error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to assign user' 
    }, { status: 500 });
  }
}
