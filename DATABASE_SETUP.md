# Database Setup Guide - DIU Learning Platform

This guide will help you fix the "Could not find the 'description' column of 'semesters' in the schema cache" error and set up the complete database schema.

## Problem

The error occurs because the Supabase database schema doesn't have the required `description` column in the `semesters` table, or the schema cache is out of sync with your application's expectations.

## 🚀 Quick Fix (RECOMMENDED)

### Option 1: Complete Database Setup (One-Click Solution)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `scripts/complete-database-setup.sql`
5. Click **Run** to execute the script

This will:
- ✅ Create all required tables with proper schema
- ✅ Add missing columns to existing tables
- ✅ Set up indexes for performance
- ✅ Configure Row Level Security (RLS)
- ✅ Add sample data for testing
- ✅ Create default admin user

### Option 2: Schema Only Setup

If you only want to fix the schema without sample data:

1. Go to **SQL Editor** in Supabase
2. Copy and paste the contents of `scripts/setup-database.sql`
3. Click **Run** to execute the script

### Option 3: Individual Scripts (Advanced)

Execute these scripts in your Supabase SQL Editor in this exact order:

1. `scripts/01-create-tables.sql` - Creates all tables with column fixes
2. `scripts/02-seed-data.sql` - Adds comprehensive sample data
3. `scripts/03-admin-tables.sql` - Creates admin tables
4. `scripts/04-alter-topics-add-description.sql` - Legacy column fix

### Option 4: Emergency Quick Fix

If you just need to add the missing `description` column immediately:

1. Go to Supabase SQL Editor
2. Run this command:

```sql
ALTER TABLE semesters ADD COLUMN IF NOT EXISTS description TEXT;
```

Then restart your application.

## 📋 Database Schema Overview

The complete schema includes these tables:

### Core Tables
- **semesters** - Academic semesters with descriptions, sections, exam flags
- **courses** - Courses linked to semesters with teacher information
- **topics** - Course topics with descriptions and ordering
- **slides** - Google Drive slide presentations linked to topics
- **videos** - YouTube videos linked to topics
- **study_tools** - Exam materials (previous questions, notes, syllabus, etc.)

### Admin Tables
- **admin_users** - Admin user accounts with roles
- **admin_sessions** - Session management for admin authentication

### Key Features
- 🔒 Row Level Security (RLS) enabled
- ⚡ Performance indexes on all foreign keys
- 🔄 Auto-updating timestamps
- 📊 Comprehensive sample data
- 👤 Default admin user (admin@diu.edu.bd)

## Verification

After running the setup scripts, verify everything is working:

### Method 1: Using the Verification Script

```bash
npm run db:verify
```

This will check all tables and columns and test creating a semester.

### Method 2: Manual Verification in Supabase

1. Go to **Table Editor** in Supabase
2. Check that the `semesters` table exists
3. Verify it has these columns:
   - `id` (uuid)
   - `title` (varchar)
   - `description` (text) ← This should be present
   - `section` (varchar)
   - `has_midterm` (boolean)
   - `has_final` (boolean)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

### Method 3: Test in Your Application

Try creating a semester through your application's admin interface. The error should be resolved.

## Common Issues

### Issue 1: "Table doesn't exist"
**Solution**: Run `scripts/setup-database.sql` to create all tables.

### Issue 2: "Column doesn't exist"
**Solution**: Run `scripts/fix-semesters-description.sql` to add missing columns.

### Issue 3: "Permission denied"
**Solution**: Make sure you're using the `SUPABASE_SERVICE_ROLE_KEY` in your environment variables.

### Issue 4: "Schema cache out of sync"
**Solution**: 
1. Go to Supabase Dashboard
2. Navigate to **Settings** > **API**
3. Click **Restart API** to refresh the schema cache

## Environment Variables

Make sure your `.env.local` file has these variables:

```env
SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 📁 Files Overview

### New/Updated Files
- **`scripts/complete-database-setup.sql`** - 🌟 **MAIN FILE** - Complete setup in one script
- **`scripts/setup-database.sql`** - Schema-only setup with column fixes
- **`scripts/02-seed-data.sql`** - Updated with comprehensive sample data
- **`scripts/01-create-tables.sql`** - Updated with column existence checks
- **`scripts/verify-database.js`** - Database verification tool
- **`scripts/fix-semesters-description.sql`** - Quick fix for missing columns
- **`DATABASE_SETUP.md`** - This comprehensive guide
- **`package.json`** - Added `db:verify` script

### Default Admin Credentials
- **Email:** admin@diu.edu.bd
- **Password:** admin123
- **Role:** super_admin

## 🔧 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Table doesn't exist" | Run `complete-database-setup.sql` |
| "Column doesn't exist" | Run the column fix scripts or complete setup |
| "Permission denied" | Check `SUPABASE_SERVICE_ROLE_KEY` in env |
| "Schema cache out of sync" | Restart API in Supabase Settings |
| "RLS policy error" | Ensure service role is used for admin operations |

### Environment Variables Check

Ensure your `.env.local` has:
```env
SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 🧪 Testing & Verification

### Automated Verification
```bash
npm run db:verify
```

### Manual Testing Steps
1. ✅ Check tables exist in Supabase Table Editor
2. ✅ Verify `semesters` table has `description` column
3. ✅ Test creating a semester in your app
4. ✅ Check admin login works
5. ✅ Verify sample data is present

### Expected Results
- All tables created with proper columns
- Sample data inserted (semesters, courses, topics, etc.)
- Admin user can log in
- No more "description column" errors

## 🚀 Next Steps

1. **Run the setup:** Execute `complete-database-setup.sql` in Supabase
2. **Verify:** Run `npm run db:verify` to confirm everything works
3. **Test:** Try creating a semester in your application
4. **Customize:** Add your own courses and content
5. **Deploy:** Your application should now work without errors

## 📞 Support

If you continue to have issues:

1. 📊 Check Supabase Dashboard > Logs for detailed errors
2. 🔍 Verify all environment variables are correct
3. 🔄 Try restarting the Supabase API (Settings > API > Restart)
4. 🧪 Run the verification script for detailed diagnostics
5. 📋 Check that RLS policies allow your operations

---

**🎉 Success Indicator:** When you see "✅ Database setup completed successfully!" in the SQL Editor output, your database is ready!
