// lib/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/** Create/return a Supabase client the first time it’s actually used (runtime). */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    // Throw only when actually called at runtime (prevents build-time crash)
    throw new Error('Supabase env vars are missing. Check Vercel project settings.');
  }

  _client = createClient(url, key);
  return _client;
}
