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

    console.log("Creating Supabase client with:", { url, keyType: key.includes('service_role') ? 'service_role' : 'anon' })

    return createSupabaseClient(url, key, {
      auth: { persistSession: false },
      global: {
        headers: {
          'User-Agent': 'learning-platform-api'
        }
      }
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Alias kept for backward compatibility with the recent refactor          */
/* -------------------------------------------------------------------------- */
export const createDB = createClient
