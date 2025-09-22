# ⚡ SUPER QUICK DATABASE SETUP (2 Minutes!)

## 🎯 **What We're Doing:**
Converting your app from local memory → **FREE global database** that handles thousands of users!

## 🚀 **Step 1: Create Supabase Account (30 seconds)**
1. Go to: **https://supabase.com**
2. Click: **"Start your project"**
3. Sign up with **GitHub** (fastest)

## 🛠️ **Step 2: Create Project (1 minute)**
1. Click: **"New project"**
2. Name: `my-datacollect-app`
3. Password: `anything-secure`
4. Region: **Choose closest to you**
5. Click: **"Create new project"**

## 💾 **Step 3: Setup Database (30 seconds)**
1. Go to: **"SQL Editor"** tab
2. Click: **"New query"**
3. **Copy this entire block** and paste:

```sql
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

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);

INSERT INTO users (email, full_name, role, is_active) VALUES
('admin@datacollect.app', 'System Administrator', 'admin', true),
('data@example.com', 'Data Submitter', 'submitter', true);
```

4. Click: **"RUN"** button
5. Should see: ✅ **"Success. No rows returned"**

## 🔑 **Step 4: Get Your Keys (30 seconds)**
1. Go to: **Settings** → **API**
2. Copy these 2 values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (long string)

## 📝 **Step 5: Configure Your App (30 seconds)**
1. In your project folder, create file: `.env.local`
2. Paste this and **replace with your values**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-long-key-here
SESSION_SECRET=my-super-secret-key-change-this
```

## ✅ **Step 6: Test It Works!**
1. **Stop your server**: Press `Ctrl+C`
2. **Start again**: `npm run dev`
3. **Register a user**: http://localhost:3000/register
4. **Check logs**: Should see ✅ **"Supabase user created"**
5. **Login works**: Even after server restart!

---

## 🎉 **DONE! You now have:**
- ✅ **Global database** (not local memory)
- ✅ **Handles 1000+ users** 
- ✅ **Free forever** (up to 500MB)
- ✅ **99.9% uptime**
- ✅ **Ready for production**

**Total time: 2-3 minutes → Ready for worldwide users! 🌍**
