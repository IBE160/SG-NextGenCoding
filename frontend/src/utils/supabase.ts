// Re-export browser client for backward compatibility
// For new code, import from '@/utils/supabase-browser' for client components
// and '@/utils/supabase-server' for server components
export { createBrowserClient } from './supabase-browser'

// Note: Server-side functions should be imported from '@/utils/supabase-server'
// Do not import createServerClient or createMiddlewareClient here
// as it will cause build errors in client components
