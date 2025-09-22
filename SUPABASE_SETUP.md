# 🚀 Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with GitHub
4. Click "New Project"
5. Choose organization and name your project
6. Set a database password
7. Wait for project setup (2-3 minutes)

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (long string)

## Step 3: Configure Environment

Create `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL script
4. This creates the users and submissions tables

## Step 5: Test the Connection

1. Restart your dev server: `npm run dev`
2. Visit: `http://localhost:3000/init-demo`
3. Initialize demo users
4. Try registering or logging in

## Free Tier Limits

Supabase free tier includes:
- ✅ 500MB database storage
- ✅ 5GB bandwidth
- ✅ 50MB file uploads
- ✅ Social OAuth providers
- ✅ Row Level Security
- ✅ Real-time subscriptions

Perfect for development and small production apps!
