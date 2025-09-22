import { NextResponse } from "next/server";
import { PasswordManager } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    // Get stored passwords for debugging
    const store = PasswordManager['getPasswordStore']();
    const storedPassword = store[email?.toLowerCase()];
    
    return NextResponse.json({
      success: true,
      email: email,
      hasPassword: !!storedPassword,
      storedPassword: storedPassword, // Only for debugging - remove in production!
      allEmails: Object.keys(store),
      message: storedPassword ? `Password found: ${storedPassword}` : 'No password found'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
