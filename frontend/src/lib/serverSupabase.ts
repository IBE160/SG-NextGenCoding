// frontend/src/lib/serverSupabase.ts

import { createClient } from '@supabase/supabase-js'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies as getCookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// --- Server-side Supabase client (for Route Handlers and Server Components) ---
// This client can access cookies and use them for authentication.
export const createSupabaseServerClient = (cookies: ReadonlyRequestCookies) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Sessions are managed by cookies directly
    },
    global: {
      headers: {
        Cookie: cookies.toString(),
      },
    },
  })
}

// --- Server-side Supabase client (for Server Actions) ---
// This client is specifically for Server Actions which have a different cookie handling context.
// Note: Use createServerClient from @/utils/supabase for Server Actions with cookie management
export const createSupabaseServerActionClient = async () => {
  const cookieStore = await getCookies()
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  })
}
