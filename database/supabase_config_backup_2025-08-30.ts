// ============================================================================
// SUPABASE CONFIGURATION BACKUP
// Generated: 2025-08-30
// Description: Complete backup of Supabase client configuration and utilities
// ============================================================================

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/* -------------------------------------------------------------------------- */
/* Utility to pick the correct URL + KEY depending on server / browser        */
/* -------------------------------------------------------------------------- */
function getSupabaseConfig() {
  const isServer = typeof window === "undefined"

  const url =
    (isServer ? process.env.SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL) ?? process.env.NEXT_PUBLIC_SUPABASE_URL

  const key =
    (isServer ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("Missing Supabase environment variables:", {
      url: !!url,
      key: !!key,
      isServer,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    throw new Error("Missing Supabase environment variables")
  }

  return { url, key }
}

/* -------------------------------------------------------------------------- */
/* 1. Singleton client for the **browser** (works in client components)       */
/* -------------------------------------------------------------------------- */
const { url: browserUrl, key: browserKey } = getSupabaseConfig()
export const supabase = createSupabaseClient(browserUrl, browserKey)

/* -------------------------------------------------------------------------- */
/* 2. Helper for server-side code (API routes, Server Actions, etc.)          */
/* -------------------------------------------------------------------------- */
export function createClient() {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      console.error("Supabase configuration missing:", {
        hasUrl: !!url,
        hasKey: !!key,
        envVars: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      })
      throw new Error("Missing Supabase environment variables")
    }

    return createSupabaseClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    throw error
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Alternative createDB function (legacy compatibility)                     */
/* -------------------------------------------------------------------------- */
export function createDB() {
  return createClient()
}

/* -------------------------------------------------------------------------- */
/* 4. Type definitions for admin authentication                               */
/* -------------------------------------------------------------------------- */
export interface AdminUser {
  id: string
  email: string
  password_hash?: string
  full_name: string
  role: 'super_admin' | 'admin' | 'moderator' | 'content_creator'
  department?: string
  phone?: string
  is_active: boolean
  last_login?: string
  login_count: number
  created_at: string
  updated_at: string
}

export interface AdminSession {
  id: string
  user_id: string
  session_token: string
  ip_address?: string
  user_agent?: string
  expires_at: string
  is_active: boolean
  created_at: string
}

/* -------------------------------------------------------------------------- */
/* 5. Admin authentication helper functions                                   */
/* -------------------------------------------------------------------------- */
export async function getAdminUser(email: string): Promise<AdminUser | null> {
  try {
    const client = createClient()
    const { data, error } = await client
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return data as AdminUser
  } catch (error) {
    console.error('Error fetching admin user:', error)
    return null
  }
}

export async function createAdminSession(
  userId: string, 
  sessionToken: string, 
  expiresAt: Date,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    const client = createClient()
    const { error } = await client
      .from('admin_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        is_active: true
      })

    return !error
  } catch (error) {
    console.error('Error creating admin session:', error)
    return false
  }
}

export async function validateAdminSession(sessionToken: string): Promise<AdminUser | null> {
  try {
    const client = createClient()
    const { data: session, error: sessionError } = await client
      .from('admin_sessions')
      .select(`
        *,
        admin_users (*)
      `)
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session || !session.admin_users) {
      return null
    }

    return session.admin_users as AdminUser
  } catch (error) {
    console.error('Error validating admin session:', error)
    return null
  }
}

export async function updateLoginStats(userId: string): Promise<void> {
  try {
    const client = createClient()
    
    // Get current login count
    const { data: user } = await client
      .from('admin_users')
      .select('login_count')
      .eq('id', userId)
      .single()

    // Update last login and increment login count
    await client
      .from('admin_users')
      .update({
        last_login: new Date().toISOString(),
        login_count: (user?.login_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
  } catch (error) {
    console.error('Error updating login stats:', error)
  }
}

export async function deactivateAdminSession(sessionToken: string): Promise<boolean> {
  try {
    const client = createClient()
    const { error } = await client
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken)

    return !error
  } catch (error) {
    console.error('Error deactivating admin session:', error)
    return false
  }
}

/* -------------------------------------------------------------------------- */
/* 6. Environment variables documentation                                     */
/* -------------------------------------------------------------------------- */
/*
Required Environment Variables:

1. SUPABASE_URL - Your Supabase project URL
   Example: https://your-project.supabase.co

2. NEXT_PUBLIC_SUPABASE_URL - Public Supabase URL (same as above)
   Example: https://your-project.supabase.co

3. SUPABASE_SERVICE_ROLE_KEY - Service role key for server-side operations
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

4. NEXT_PUBLIC_SUPABASE_ANON_KEY - Anonymous key for client-side operations
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

5. JWT_SECRET - Secret key for JWT token signing
   Example: your-super-secret-jwt-key-change-in-production

Add these to your .env.local file:
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
*/

/* -------------------------------------------------------------------------- */
/* 7. Database connection test function                                       */
/* -------------------------------------------------------------------------- */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = createClient()
    const { data, error } = await client
      .from('admin_users')
      .select('count')
      .limit(1)

    return !error
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

// Export default client for backward compatibility
export default supabase
