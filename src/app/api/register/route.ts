import { NextResponse } from "next/server";
import { registerUser } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, department, phone } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: "Name, email, and password are required" 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: "Please enter a valid email address" 
      }, { status: 400 });
    }

    // Register user
    const result = registerUser({
      name,
      email,
      password,
      department,
      phone,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        user: {
          id: result.user?.id,
          name: result.user?.name,
          email: result.user?.email,
          role: result.user?.role,
        },
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Registration failed. Please try again." 
    }, { status: 500 });
  }
}

