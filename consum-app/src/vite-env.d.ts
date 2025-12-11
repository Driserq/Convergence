/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_AI_API_KEY?: string
  readonly VITE_SUPADATA_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}
