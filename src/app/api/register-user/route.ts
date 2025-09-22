import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

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
  console.log('⚠️  Supabase not configured, using local fallback for registration')
}

// Registration schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  organization: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, organization, phone } = registerSchema.parse(body)

    // If Supabase is not configured, use local fallback
    if (!isSupabaseConfigured || !supabase) {
      console.log('Using local fallback for user registration')
      
      // Import local database service
      const { LocalDatabaseService } = await import('@/lib/local-database')
      
      // Check if user already exists
      const existingUser = await LocalDatabaseService.getUserByEmail(email)
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
      
      // Create user in local database with pending status
      const newUser = await LocalDatabaseService.createUser({
        email,
        role: 'submitter',
        full_name: fullName,
        is_active: false, // User needs admin approval
        status: 'pending' // New field for approval status
      })
      
      // Store password in password manager
      const { PasswordManager } = await import('@/lib/password')
      PasswordManager.storePassword(email, password)
      
      return NextResponse.json({
        success: true,
        message: 'Registration submitted successfully! Your account is pending admin approval. You will receive an email once approved.',
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          is_active: newUser.is_active,
          status: 'pending',
          created_at: newUser.created_at
        }
      })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const { data: hashData, error: hashError } = await supabase.rpc('crypt', {
      password: password,
      salt: 'gen_salt'
    })

    if (hashError) {
      console.error('Password hashing error:', hashError)
      return NextResponse.json(
        { error: 'Failed to process registration' },
        { status: 500 }
      )
    }

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: hashData,
        full_name: fullName,
        organization: organization || '',
        phone: phone || '',
        role: 'submitter',
        is_active: true,
        email_verified: false
      }])
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Return success (without password hash)
    const { password_hash, ...userWithoutPassword } = user
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
