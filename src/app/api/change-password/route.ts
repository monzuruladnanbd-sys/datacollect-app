import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { PasswordManager } from "@/lib/password";

export async function POST(req: Request) {
  try {
    console.log('🔑 Change password API called');
    const session = await getSession();
    console.log('🔑 Session:', session);
    if (!session.user) {
      console.log('❌ No user in session');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ User in session:', session.user.email);

    const body = await req.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'All password fields are required' 
      }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'New passwords do not match' 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'New password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Change password using PasswordManager
    console.log('🔑 Attempting to change password for:', session.user.email);
    console.log('🔑 Old password provided:', oldPassword ? 'Yes' : 'No');
    console.log('🔑 New password provided:', newPassword ? 'Yes' : 'No');
    
    const result = PasswordManager.changePassword(
      session.user.email,
      oldPassword,
      newPassword
    );
    
    console.log('🔑 Password change result:', result);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 });
    }

    console.log(`✅ Password changed successfully for: ${session.user.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error("Change password API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to change password" 
    }, { status: 500 });
  }
}
