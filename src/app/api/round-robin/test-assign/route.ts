import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { RoundRobinService } from "@/lib/round-robin";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { role } = await req.json();
    
    if (!role || !['reviewer', 'approver'].includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role. Must be "reviewer" or "approver"' 
      }, { status: 400 });
    }

    console.log(`🧪 Testing ${role} assignment...`);

    let assignedUser: string | null = null;
    
    if (role === 'reviewer') {
      assignedUser = await RoundRobinService.getNextReviewer();
    } else if (role === 'approver') {
      assignedUser = await RoundRobinService.getNextApprover();
    }

    const dashboardData = await RoundRobinService.getWorkloadDashboard();

    return NextResponse.json({ 
      success: true, 
      assignedUser,
      role,
      workloadData: dashboardData,
      message: `Test assignment for ${role}: ${assignedUser || 'No user available'}` 
    });

  } catch (error) {
    console.error('Test assignment error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to test assignment' 
    }, { status: 500 });
  }
}
