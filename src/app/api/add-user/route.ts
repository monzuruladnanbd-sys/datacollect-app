import { NextResponse } from "next/server";
import { PasswordManager } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    
    // Store password
    PasswordManager.storePassword(email, password);
    
    // Add to local database manually
    const { LocalDatabaseService } = await import('@/lib/local-database');
    
    try {
      const newUser = await LocalDatabaseService.createUser({
        email: email,
        role: 'submitter',
        full_name: name || 'User',
        is_active: true,
        status: 'pending',
      });
      
      console.log(`✅ Manually added user: ${email}`);
      
      return NextResponse.json({
        success: true,
        message: `User ${email} added successfully`,
        user: newUser
      });
    } catch (error) {
      console.error('Error adding user:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to add user to database',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Invalid request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}
