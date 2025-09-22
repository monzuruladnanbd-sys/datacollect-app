import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { LocalDatabaseService } from "@/lib/local-database";
import { PasswordManager } from "@/lib/password";

export async function GET() {
  try {
    console.log('🔍 === USER SYSTEM DEBUG REPORT ===');
    
    // 1. Check current session
    const session = await getSession();
    console.log('📋 Current Session:', session);
    
    // 2. Check all users in local database
    const allUsers = await LocalDatabaseService.getUsers();
    console.log('👥 All Users in Database:', allUsers.map(u => ({ id: u.id, email: u.email, role: u.role, status: u.status })));
    
    // 3. Check password store
    const passwordStore = (PasswordManager as any).getPasswordStore();
    console.log('🔐 Password Store Keys:', Object.keys(passwordStore));
    
    // 4. Check global state
    const globalUsers = (global as any).localUsers || [];
    console.log('🌐 Global Users State:', globalUsers.map((u: any) => ({ id: u.id, email: u.email, role: u.role, status: u.status })));
    
    // 5. Check sample data user format
    const { forceRefreshSampleData } = await import('@/lib/database');
    const sampleData = forceRefreshSampleData();
    console.log('📊 Sample Data User Formats:', sampleData.map((item: any) => ({ id: item.id, user: item.user })));
    
    return NextResponse.json({
      success: true,
      debug: {
        session: session,
        currentUser: session.user,
        allUsers: allUsers.map(u => ({ id: u.id, email: u.email, role: u.role, status: u.status })),
        passwordKeys: Object.keys(passwordStore),
        globalUsers: globalUsers.map((u: any) => ({ id: u.id, email: u.email, role: u.role, status: u.status })),
        sampleDataUsers: sampleData.map((item: any) => ({ id: item.id, user: item.user })),
        issues: []
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
