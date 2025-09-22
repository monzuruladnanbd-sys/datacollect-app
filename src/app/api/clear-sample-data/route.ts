import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { forceRefreshSampleData } from "@/lib/database";

export async function POST(req: Request) {
  try {
    // Check if user is admin
    const session = await getSession();
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧹 Clearing all sample data...');

    // Force refresh sample data (which will clear it)
    const clearedData = forceRefreshSampleData();
    
    console.log('✅ Sample data cleared successfully, count:', clearedData.length);

    return NextResponse.json({
      success: true,
      message: "All sample data has been cleared successfully",
      count: clearedData.length
    });

  } catch (error) {
    console.error('❌ Error clearing sample data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear sample data' },
      { status: 500 }
    );
  }
}
