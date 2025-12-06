// frontend/src/lib/supabase.ts

import { createBrowserClient } from '@supabase/ssr';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// --- Client-side Supabase client ---
export const createSupabaseBrowserClient = () => {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key:', supabaseAnonKey);
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Helper to get current session (client-side)
export const getSession = async () => {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

// Helper to get current user (client-side)
export const getUser = async () => {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};
