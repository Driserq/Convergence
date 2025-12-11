import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using process.env
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase Server] Missing environment variables')
  console.warn('[Supabase Server] SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.warn('[Supabase Server] SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // Server-side doesn't need session persistence
      autoRefreshToken: false,
    }
  }
)

if (supabaseUrl && supabaseAnonKey) {
  console.log('[Supabase Server] Client initialized')
}
