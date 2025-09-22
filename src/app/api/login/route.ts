import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { getSession, login } from '@/lib/auth'

// Check if Supabase is configured
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'

let supabase: any = null

if (isSupabaseConfigured) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} else {
  console.log('⚠️  Supabase not configured, using local fallback for login')
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // If Supabase is not configured, use existing auth system
    if (!isSupabaseConfigured || !supabase) {
      console.log('Using local fallback for login')
      const result = await login(email, password);
      return NextResponse.json(result);
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, full_name, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      console.log('User not found in database:', email, error);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('User found in database:', user.email, user.role);

    // Use local PasswordManager for password verification (since we don't have RPC function)
    const { PasswordManager } = await import('@/lib/password');
    const passwordValid = PasswordManager.verifyPassword(email, password);
    
    if (!passwordValid) {
      console.log('Password verification failed for:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Password verified for:', email);

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Use existing login function for session management
    return NextResponse.json(await login(email, password));

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


