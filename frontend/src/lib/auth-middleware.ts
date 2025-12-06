// frontend/src/lib/auth-middleware.ts

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Ensures the user's access token is valid and refreshed if needed.
 * This is critical for operations that require authentication.
 */
export async function ensureValidSession() {
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return null;
    }

    if (!session) {
      console.log('No active session');
      return null;
    }

    // Check if the access token is expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      console.log('Access token expired, attempting to refresh...');
      
      // Try to refresh the token using the refresh token
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !newSession) {
        console.error('Failed to refresh session:', refreshError);
        return null;
      }

      console.log('Session refreshed successfully');
      return newSession;
    }

    // Session is still valid
    return session;
  } catch (error) {
    console.error('Error in ensureValidSession:', error);
    return null;
  }
}

/**
 * Get the current valid access token, refreshing if necessary
 */
export async function getValidAccessToken(): Promise<string | null> {
  const session = await ensureValidSession();
  return session?.access_token || null;
}
