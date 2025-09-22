import { NextResponse } from "next/server";
import { PasswordManager } from "@/lib/password";
import { DatabaseService } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token, newPassword, confirmPassword } = body;

    if (!email || !token || !newPassword || !confirmPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'All fields are required' 
      }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Passwords do not match' 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Check if user exists
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid reset request' 
      }, { status: 400 });
    }

    // In production, you would:
    // 1. Validate the token from database
    // 2. Check if token is not expired
    // 3. Check if token is not already used
    // 4. Mark token as used after successful reset

    // For demo purposes, we'll accept any token for valid emails
    console.log(`🔑 Password reset request for: ${email} with token: ${token}`);

    // Reset password using PasswordManager
    const result = PasswordManager.resetPassword(email, newPassword);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 });
    }

    console.log(`✅ Password reset successfully for: ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully. You can now login with your new password.' 
    });

  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to reset password" 
    }, { status: 500 });
  }
}
