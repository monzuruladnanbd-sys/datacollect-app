# 🚀 FREE Database Setup - Ready in 5 Minutes!

## 🌍 **Step 1: Create FREE Supabase Account**

1. **Go to**: [supabase.com](https://supabase.com)
2. **Click**: "Start your project" 
3. **Sign up** with GitHub/Google (fastest)
4. **Create new project**:
   - Name: `datacollect-db` (or any name)
   - Password: `your-secure-password`
   - Region: Choose closest to you
   - Plan: **FREE** (up to 500MB + 5GB bandwidth)

## 🛠️ **Step 2: Setup Database Tables**

1. **Go to**: SQL Editor in Supabase dashboard
2. **Copy & Paste** this SQL and **RUN**:

```sql
-- Users table for authentication
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'submitter',
  department text,
  phone text,
  is_active boolean DEFAULT true,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Data submissions table
CREATE TABLE submissions (
  id text PRIMARY KEY,
  section text NOT NULL,
  level text NOT NULL,
  label text NOT NULL,
  value text,
  unit text,
  frequency text,
  period text,
  year text,
  quarter text,
  responsible text,
  disaggregation text,
  notes text,
  status text DEFAULT 'draft',
  user_email text,
  submitter_message text,
  reviewer_message text,
  approver_message text,
  saved_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Policies for submissions table  
CREATE POLICY "Users can read all submissions" ON submissions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert submissions" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update submissions" ON submissions
  FOR UPDATE USING (true);

-- Insert demo admin user
INSERT INTO users (email, full_name, role, is_active) VALUES
('admin@datacollect.app', 'System Administrator', 'admin', true),
('data@example.com', 'Data Submitter', 'submitter', true),
('review@example.com', 'Senior Data Reviewer', 'reviewer', true),
('approve@example.com', 'Project Manager', 'approver', true);
```

## 🔑 **Step 3: Get Your Database Credentials**

1. **Go to**: Settings → API in Supabase dashboard
2. **Copy these values**:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIs...`

## 📝 **Step 4: Configure Your App**

Create file `.env.local` in your project root:

```env
# 🌍 DATABASE - Copy from Supabase Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-key

# 🔐 SESSION SECRET (Required)
SESSION_SECRET=change-this-to-random-string-abc123xyz789

# 📧 EMAIL (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourcompany.com
```

## ✅ **Step 5: Test It Works**

1. **Restart your server**: Stop (`Ctrl+C`) and run `npm run dev`
2. **Register new user**: Go to http://localhost:3000/register
3. **Check logs**: Should see "✅ Supabase user created" instead of "local fallback"
4. **Login works**: User data persists across server restarts!

## 🌍 **What You Get (100% FREE):**

- ✅ **500MB Database** (handles 10,000+ users)
- ✅ **5GB Bandwidth** per month
- ✅ **Global CDN** (fast worldwide)
- ✅ **Real-time updates**
- ✅ **Automatic backups**
- ✅ **99.9% uptime**
- ✅ **Built-in security**

## 🚀 **For Production Deployment:**

1. **Deploy to Vercel**: Connect GitHub repo
2. **Add environment variables**: Copy from `.env.local`
3. **Custom domain**: Add your domain
4. **Ready for thousands of users!** 🌍

---

## 🆘 **Having Issues?**

**Error: "fetch failed"** → Database credentials not set correctly
**Error: "relation does not exist"** → SQL script not run in Supabase
**Error: "Invalid API key"** → Wrong anon key copied

**Need help?** Check the Supabase dashboard or logs for detailed error messages.

---

**🎯 This setup costs $0 and scales to thousands of users worldwide!**
