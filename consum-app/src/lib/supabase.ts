import { createClient } from '@supabase/supabase-js'

// Get environment variables from window (set by Vite in main.tsx)
const getSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
  }
  return ''
}

const getSupabaseAnonKey = () => {
  if (typeof window !== 'undefined') {
    return window.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
  }
  return ''
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

// Warn if missing but don't throw (allow Landing page to load)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables. Auth features will not work.')
  console.warn('[Supabase] SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.warn('[Supabase] SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

// Create Supabase client (will work even with empty strings, but features will fail)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)

if (import.meta.env.DEV && supabaseUrl && supabaseAnonKey) {
  console.log('[Supabase] Client initialized with URL:', supabaseUrl)
}
