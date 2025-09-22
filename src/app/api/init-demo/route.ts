import { NextResponse } from "next/server";
import { populateDemoUsers } from "@/scripts/populate-demo-users";

export async function POST() {
  try {
    console.log('🔄 Initializing demo users...');
    await populateDemoUsers();
    
    return NextResponse.json({
      success: true,
      message: "Demo users initialized successfully",
      credentials: {
        admin: "admin@datacollect.app / admin123",
        submitter: "data@example.com / Passw0rd!",
        reviewer: "review@example.com / Passw0rd!",
        approver: "approve@example.com / Passw0rd!",
        yourAccount: "monzurul.adnan.bd@gmail.com / yourpassword"
      }
    });
  } catch (error) {
    console.error('❌ Error initializing demo users:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to initialize demo users",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
