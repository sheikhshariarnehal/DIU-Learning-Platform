# Admin Authentication System Restoration Guide

**Generated:** 2025-08-30  
**Purpose:** Complete guide to restore admin authentication system from backup files

## 📋 Table of Contents
1. [Backup Files Overview](#backup-files-overview)
2. [Prerequisites](#prerequisites)
3. [Database Restoration](#database-restoration)
4. [API Routes Restoration](#api-routes-restoration)
5. [Configuration Restoration](#configuration-restoration)
6. [Verification Steps](#verification-steps)
7. [Troubleshooting](#troubleshooting)

## 📁 Backup Files Overview

The following backup files have been created in the `database/` folder:

1. **`admin_auth_backup_2025-08-30.sql`** - Complete database schema, constraints, indexes, and RLS policies
2. **`admin_auth_api_backup_2025-08-30.md`** - API routes and middleware logic documentation
3. **`supabase_config_backup_2025-08-30.ts`** - Supabase client configuration and helper functions
4. **`ADMIN_AUTH_RESTORATION_GUIDE.md`** - This restoration guide

## 🔧 Prerequisites

Before starting the restoration process, ensure you have:

- [ ] Supabase project access with admin privileges
- [ ] Environment variables configured
- [ ] Node.js and npm/yarn installed
- [ ] Next.js project structure in place
- [ ] Required dependencies installed

### Required Dependencies
```bash
npm install @supabase/supabase-js bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

## 🗄️ Database Restoration

### Step 1: Execute Database Schema
Run the SQL backup file in your Supabase SQL editor:

```sql
-- Execute the contents of: admin_auth_backup_2025-08-30.sql
-- This will create:
-- - admin_users table with all constraints
-- - admin_sessions table with relationships
-- - Indexes for performance
-- - RLS policies for security
-- - Triggers for auto-updating timestamps
```

### Step 2: Create Default Admin User
Since password hashes are excluded from backup for security, create a default admin user:

```sql
-- Replace 'your-hashed-password' with actual bcrypt hash
INSERT INTO public.admin_users (
    email, password_hash, full_name, role, department, phone, is_active
) VALUES (
    'admin@diu.edu.bd',
    '$2a$12$your-hashed-password-here',
    'System Administrator',
    'admin',
    'IT Department',
    '+880-1234-567890',
    true
);
```

### Step 3: Verify Database Structure
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'admin_sessions');

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('admin_users', 'admin_sessions');

-- Check policies exist
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('admin_users', 'admin_sessions');
```

## 🔌 API Routes Restoration

### Step 1: Restore Middleware
Create/update `middleware.ts` in project root:
```typescript
// Copy content from admin_auth_api_backup_2025-08-30.md
// Section: Middleware Authentication
```

### Step 2: Restore Authentication Routes
Create the following API route files:

**`app/api/auth/login/route.ts`**
```typescript
// Copy content from admin_auth_api_backup_2025-08-30.md
// Section: Login API Route
```

**`app/api/auth/me/route.ts`**
```typescript
// Copy content from admin_auth_api_backup_2025-08-30.md
// Section: Authentication Verification
```

**`app/api/admin/users/route.ts`**
```typescript
// Copy content from admin_auth_api_backup_2025-08-30.md
// Section: User Management API Routes
```

### Step 3: Restore User Management Routes
**`app/api/admin/users/[id]/route.ts`**
```typescript
// Implement PUT and DELETE methods for user management
// Reference the existing codebase for complete implementation
```

## ⚙️ Configuration Restoration

### Step 1: Restore Supabase Configuration
Create/update `lib/supabase.ts`:
```typescript
// Copy content from supabase_config_backup_2025-08-30.ts
```

### Step 2: Environment Variables
Create/update `.env.local`:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Optional: Additional security settings
NODE_ENV=production
```

### Step 3: Next.js Configuration
Ensure `next.config.mjs` includes necessary configurations:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  }
}

export default nextConfig
```

## ✅ Verification Steps

### Step 1: Database Verification
```sql
-- Test admin user creation
SELECT id, email, full_name, role, is_active FROM admin_users;

-- Test RLS policies
SET role TO 'anon';
SELECT * FROM admin_users; -- Should return no rows due to RLS

-- Reset role
RESET role;
```

### Step 2: API Verification
Test the following endpoints:

1. **Login Test:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@diu.edu.bd","password":"your-password"}'
```

2. **Authentication Test:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: admin_token=your-jwt-token"
```

3. **User Management Test:**
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Cookie: admin_token=your-jwt-token"
```

### Step 3: Frontend Verification
1. Navigate to `/login` - should show login form
2. Navigate to `/admin` without token - should redirect to login
3. Login with admin credentials - should redirect to admin dashboard
4. Access admin routes - should work with valid session

## 🔧 Troubleshooting

### Common Issues and Solutions

**Issue: "Missing Supabase environment variables"**
- Solution: Verify all environment variables are set correctly
- Check both `.env.local` and deployment environment

**Issue: "Invalid token" errors**
- Solution: Ensure JWT_SECRET matches between token creation and verification
- Clear browser cookies and login again

**Issue: "RLS policy prevents access"**
- Solution: Verify RLS policies are correctly applied
- Check if service role is being used for API operations

**Issue: "Password hash mismatch"**
- Solution: Ensure bcrypt is used with correct salt rounds (12)
- Verify password hashing in user creation

**Issue: "Session not found"**
- Solution: Check admin_sessions table structure
- Verify foreign key relationships are intact

### Database Recovery Commands
```sql
-- Disable RLS temporarily for debugging
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing issues
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Reset admin user password
UPDATE admin_users 
SET password_hash = '$2a$12$new-hashed-password'
WHERE email = 'admin@diu.edu.bd';
```

### API Debugging
```typescript
// Add to API routes for debugging
console.log('Request headers:', Object.fromEntries(request.headers.entries()));
console.log('Cookies:', request.cookies.getAll());
console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasJwtSecret: !!process.env.JWT_SECRET
});
```

## 📞 Support

If you encounter issues during restoration:

1. Check the original backup files for reference
2. Verify all dependencies are installed
3. Ensure environment variables match your Supabase project
4. Test database connectivity separately
5. Review Supabase logs for detailed error messages

## 🔄 Backup Verification

To verify the backup is complete and functional:

1. **Schema Verification:** All tables, constraints, and indexes exist
2. **Policy Verification:** RLS policies are active and functional
3. **API Verification:** All authentication endpoints respond correctly
4. **Security Verification:** Unauthorized access is properly blocked
5. **Session Verification:** Login/logout flow works end-to-end

---

**Last Updated:** 2025-08-30  
**Backup Version:** 1.0  
**Compatibility:** Next.js 14+, Supabase, PostgreSQL
