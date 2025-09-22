import { NextResponse } from "next/server";
import { forceRefreshSampleData } from "@/lib/database";

export async function POST() {
  try {
    console.log('🔄 API endpoint called to force refresh sample data');
    const refreshedData = forceRefreshSampleData();
    
    return NextResponse.json({
      success: true,
      message: "Sample data refreshed successfully",
      count: refreshedData.length,
      users: []
    });
  } catch (error) {
    console.error('Error refreshing sample data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh sample data' },
      { status: 500 }
    );
  }
}
