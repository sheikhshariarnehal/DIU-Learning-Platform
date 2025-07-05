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
  const { url, key } = getSupabaseConfig()
  return createSupabaseClient(url, key, { auth: { persistSession: false } })
}

/* -------------------------------------------------------------------------- */
/* 3. Alias kept for backward compatibility with the recent refactor          */
/* -------------------------------------------------------------------------- */
export const createDB = createClient
