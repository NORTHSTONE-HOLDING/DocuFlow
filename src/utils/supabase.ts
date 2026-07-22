import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Hybrid Supabase preparation.
 * - If VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set → real client
 * - Otherwise → null (app uses LocalStorage mock auth offline)
 */
export function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('your-project') || key === 'your-anon-key') {
    return null;
  }
  return createClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
