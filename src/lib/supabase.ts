// Supabase Client Configuration
import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  
  return supabaseInstance;
}

// Server-side client (uses service role key)
export function createServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    throw new Error('Supabase server credentials not configured');
  }
  
  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default supabaseInstance;