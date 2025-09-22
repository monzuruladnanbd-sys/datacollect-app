import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Check if user is admin
    const session = await getSession();
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧹 Starting cleanup of test accounts...');

    // Access the global state directly
    const global = globalThis as any;
    let localUsers = global.localUsers || [];

    console.log('📋 Current users before cleanup:');
    localUsers.forEach((user: any) => {
      console.log(`  - ${user.email} (ID: ${user.id}, Status: ${user.status})`);
    });

    // Define test accounts to remove (these were created during debugging)
    const testAccountsToRemove: string[] = [
      // No test accounts to remove - they're all removed from the codebase
    ];

    // Filter out test accounts
    const originalUsers = localUsers.filter((user: any) => {
      const shouldKeep = !testAccountsToRemove.includes(user.email);
      if (!shouldKeep) {
        console.log(`🗑️ Removing test account: ${user.email}`);
      }
      return shouldKeep;
    });

    // Update global state
    global.localUsers = originalUsers;

    console.log('\n📋 Users after cleanup:');
    originalUsers.forEach((user: any) => {
      console.log(`  - ${user.email} (ID: ${user.id}, Status: ${user.status})`);
    });

    const removedCount = localUsers.length - originalUsers.length;
    console.log(`\n✅ Cleanup completed! Removed ${removedCount} test accounts.`);
    console.log(`📊 Total users remaining: ${originalUsers.length}`);

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${removedCount} test accounts`,
      removedAccounts: testAccountsToRemove.filter(email => 
        localUsers.some((user: any) => user.email === email)
      ),
      remainingUsers: originalUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      }))
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup test accounts' },
      { status: 500 }
    );
  }
}
