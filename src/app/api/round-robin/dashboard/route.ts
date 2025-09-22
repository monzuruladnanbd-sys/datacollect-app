import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { RoundRobinService } from "@/lib/round-robin";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view workload dashboard
    if (session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only admins can view workload dashboard' 
      }, { status: 403 });
    }

    console.log('📊 Getting workload dashboard data...');

    const dashboardData = await RoundRobinService.getWorkloadDashboard();
    const config = RoundRobinService.getConfig();

    console.log('✅ Workload dashboard data retrieved');

    return NextResponse.json({ 
      success: true, 
      data: dashboardData,
      config
    });

  } catch (error) {
    console.error('Workload dashboard error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get workload data' 
    }, { status: 500 });
  }
}
