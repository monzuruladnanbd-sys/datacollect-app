import { NextResponse } from "next/server";
import { DatabaseService } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Check if user exists in database
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: 'If the email exists in our system, a password reset link has been sent.' 
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json({ 
        success: false, 
        error: 'Account is inactive. Please contact administrator.' 
      }, { status: 403 });
    }

    // Generate a simple reset token (in production, use proper JWT or crypto)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    // Store reset token temporarily (in production, use database with expiration)
    const resetData = {
      email: email,
      token: resetToken,
      expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      used: false
    };

    // In production, store this in a database table
    // For now, we'll use a simple approach
    console.log(`🔑 Password reset token generated for: ${email}`);
    console.log(`Token: ${resetToken} (expires in 15 minutes)`);

    // In a real implementation, you would:
    // 1. Store the token in database with expiration
    // 2. Send email with reset link
    // 3. Handle token validation and cleanup

    // For demo purposes, we'll return the token (in production, send email)
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset token generated. In production, this would be sent via email.',
      resetToken: resetToken, // Remove this in production
      expiresIn: '15 minutes'
    });

  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to process password reset request" 
    }, { status: 500 });
  }
}
