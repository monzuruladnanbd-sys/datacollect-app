# 🗄️ Database Setup Guide

This application uses **Supabase** (PostgreSQL) for a fully managed, globally distributed database solution.

## 🌟 Why Supabase?

- ✅ **100% Open Source** - No copyright issues
- ✅ **Global Edge Network** - Fast worldwide access
- ✅ **Auto-scaling** - Handles any traffic load
- ✅ **Real-time updates** - Live collaboration
- ✅ **Row Level Security** - Built-in permissions
- ✅ **Free tier** - Perfect for getting started

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub/Google
4. Click "New Project"
5. Choose organization and project name
6. Select region closest to your users
7. Set database password
8. Click "Create new project"

### 2. Get Your Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` 
   - `anon public` key

### 3. Configure Environment Variables

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SESSION_PASSWORD=your-long-random-session-password-minimum-32-characters
```

### 4. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql`
4. Paste and click "Run"
5. Wait for "Success" message

### 5. Test the Connection

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- ✅ User registration
- ✅ Data entry  
- ✅ Workflow transitions
- ✅ Real-time updates

## 🔐 Security Features

### Row Level Security (RLS)
- **Submitters** see only their own data
- **Reviewers** see submitted items only
- **Approvers** see reviewed items only  
- **Admins** see everything

### Built-in Permissions
- Create, read, update, delete based on user role
- Automatic audit trails
- Secure API endpoints

## 🌍 Production Deployment

### Vercel Integration
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Global Performance
- **Supabase Edge**: Global CDN with 15+ regions
- **Auto-scaling**: Handles millions of users
- **99.9% Uptime SLA**

## 📊 Database Schema

### Tables Created:
- `users` - User management and roles
- `submissions` - All indicator submissions
- Auto-generated indexes for performance
- Real-time subscriptions enabled

### Sample Data Included:
- Admin user: `admin@datacollect.app`
- Test users for each role
- Sample submission data

## 🔄 Migration from In-Memory

The app automatically detects if Supabase is configured:
- **With database**: Uses Supabase for all operations
- **Without database**: Falls back to localStorage
- **Gradual migration**: No data loss during transition

## 💡 Advanced Features

### Real-time Collaboration
```typescript
// Subscribe to live updates
DatabaseService.subscribeToSubmissions((payload) => {
  console.log('Real-time update:', payload)
})
```

### Custom Queries
```typescript
// Complex filtering
const data = await DatabaseService.getSubmissions({
  status: 'submitted',
  user_email: 'user@example.com',
  limit: 50
})
```

## 🆘 Troubleshooting

### Connection Issues
- Verify environment variables
- Check Supabase project status
- Ensure RLS policies are applied

### Permission Errors
- Confirm user exists in `users` table
- Check user role and `is_active` status
- Review RLS policies in Supabase dashboard

### Performance Optimization
- Use indexes (already included)
- Enable database statistics
- Monitor query performance in Supabase dashboard

## 📈 Scaling

### Free Tier Limits:
- 500MB database
- 2GB bandwidth
- 50MB file uploads
- Up to 500 concurrent users

### Paid Plans:
- Unlimited database size
- Global replication
- Point-in-time recovery
- 99.9% uptime SLA

Perfect for applications serving thousands of users worldwide! 🌐




