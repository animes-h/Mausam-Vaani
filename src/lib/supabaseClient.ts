import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to save offline user queries or cache entries
export async function logQueryToSupabase(query: string, responsePayload: any) {
  if (!supabase) return;
  try {
    await supabase.from('query_cache').insert([
      {
        query_text: query,
        response_data: responsePayload,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (e) {
    console.warn('Supabase query logging error:', e);
  }
}
