import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type {
  AuthState,
  AuthMode,
  RedirectIntent,
  User,
  Session,
  AuthError,
} from '../types/auth'

const PRODUCTION_BASE_URL = 'https://consum.app'

const prependDomain = (path: string): string => {
  if (!path) {
    return PRODUCTION_BASE_URL
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${PRODUCTION_BASE_URL}${normalized}`
}

const DEFAULT_EMAIL_REDIRECT = prependDomain('/dashboard')
const DEFAULT_GOOGLE_REDIRECT = prependDomain('/login')
const isBrowser = typeof window !== 'undefined'
const SUPABASE_URL_PARAM_KEYS = ['access_token', 'refresh_token', 'expires_in', 'token_type', 'provider_token', 'type']

export const useAuth = create<AuthState>((set, get) => {
  const hasSupabaseAuthParams = (): boolean => {
    if (!isBrowser) return false
    const hash = window.location.hash?.replace(/^#/, '') ?? ''
    const hashParams = new URLSearchParams(hash)
    const searchParams = new URLSearchParams(window.location.search)

    return SUPABASE_URL_PARAM_KEYS.some(key => hashParams.has(key) || searchParams.has(key))
  }

  const stripSupabaseAuthParams = () => {
    if (!isBrowser) return
    const url = new URL(window.location.href)

    let hashRemoved = false
    if (url.hash) {
      url.hash = ''
      hashRemoved = true
    }

    let searchMutated = false
    SUPABASE_URL_PARAM_KEYS.forEach(key => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key)
        searchMutated = true
      }
    })

    if (hashRemoved || searchMutated) {
      window.history.replaceState({}, '', `${url.origin}${url.pathname}${url.search}`)
    }
  }

  const processSupabaseRedirect = async () => {
    if (!hasSupabaseAuthParams()) {
      return
    }

    try {
      console.log('[useAuth] Processing Supabase redirect params...')
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })

      if (error) {
        console.error('[useAuth] Error completing Supabase redirect:', error)
        return
      }

      if (data.session) {
        console.log('[useAuth] Supabase redirect session ready for:', data.session.user.email)
        set({ user: data.session.user, session: data.session })
      }
    } catch (error) {
      console.error('[useAuth] Unexpected error during Supabase redirect handling:', error)
    } finally {
      stripSupabaseAuthParams()
    }
  }

  return {
  user: null,
  session: null,
  loading: true,
  authMode: 'login',
  setAuthMode: (mode: AuthMode) => set({ authMode: mode }),
  redirectIntent: null,
  setRedirectIntent: (intent: RedirectIntent | null) => set({ redirectIntent: intent }),

  // Initialize auth state - called on app startup
  initialize: async (): Promise<void> => {
    try {
      console.log('[useAuth] Initializing auth state...')

      await processSupabaseRedirect()
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[useAuth] Error getting session:', error)
        set({ user: null, session: null, loading: false })
        return
      }

      if (session) {
        console.log('[useAuth] Found existing session for user:', session.user.email)
        set({ user: session.user, session, loading: false })
      } else {
        console.log('[useAuth] No existing session found')
        set({ user: null, session: null, loading: false })
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('[useAuth] Auth state changed:', event)
        
        if (session) {
          set({ user: session.user, session, loading: false })
        } else {
          set({ user: null, session: null, loading: false })
        }
      })
      
      // Note: For MVP, we skip cleanup since initialize() runs once on app start
      // In production, you'd want to unsubscribe when component unmounts
      
    } catch (error: any) {
      console.error('[useAuth] Error initializing auth:', error)
      set({ user: null, session: null, loading: false })
    }
  },

  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      console.log('[useAuth] Attempting login for:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[useAuth] Login error:', error)
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status || 400
          }
        }
      }

      console.log('[useAuth] Login successful for user:', data.user.email)
      set({ user: data.user, session: data.session })
      
      return { success: true }
      
    } catch (error: any) {
      console.error('[useAuth] Unexpected login error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'An unexpected error occurred during login'
        }
      }
    }
  },

  // Signup with email and password
  signup: async (email: string, password: string, options?: { emailRedirectTo?: string }) => {
    try {
      console.log('[useAuth] Attempting signup for:', email)
      const emailRedirectTo = options?.emailRedirectTo ?? DEFAULT_EMAIL_REDIRECT

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        }
      })

      if (error) {
        console.error('[useAuth] Signup error:', error)
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status || 400
          }
        }
      }

      console.log('[useAuth] Signup successful for user:', data.user?.email)
      
      // Note: For email confirmation flow, user might be null initially
      if (data.session && data.user) {
        set({ user: data.user, session: data.session })
      } else {
        set({ loading: false })
      }
      
      return { success: true }
      
    } catch (error: any) {
      console.error('[useAuth] Unexpected signup error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'An unexpected error occurred during signup'
        }
      }
    }
  },

  resendVerificationEmail: async (email: string, options?: { emailRedirectTo?: string }) => {
    if (!email) {
      console.error('[useAuth] Resend verification error: missing email')
      return {
        success: false,
        error: {
          message: 'A valid email is required to resend verification',
          status: 400,
        },
      }
    }

    try {
      const emailRedirectTo = options?.emailRedirectTo ?? DEFAULT_EMAIL_REDIRECT
      console.log('[useAuth] Resending verification email for:', email)

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo,
        },
      })

      if (error) {
        console.error('[useAuth] Resend verification error:', error)
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status || 400,
          },
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error('[useAuth] Unexpected resend verification error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'Unable to resend verification email right now',
        },
      }
    }
  },

  signInWithGoogle: async (options?: { redirectTo?: string }) => {
    try {
      const redirectTo = options?.redirectTo ?? DEFAULT_GOOGLE_REDIRECT
      console.log('[useAuth] Starting Google OAuth flow with redirect:', redirectTo)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        }
      })

      if (error) {
        console.error('[useAuth] Google OAuth error:', error)
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status || 400,
          },
        }
      }

      console.log('[useAuth] Google OAuth redirect URL:', data?.url || 'N/A')
      return { success: true }
    } catch (error: any) {
      console.error('[useAuth] Unexpected Google OAuth error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'Unable to start Google sign-in',
        },
      }
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      console.log('[useAuth] Logging out user')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[useAuth] Logout error:', error)
      } else {
        console.log('[useAuth] Logout successful')
      }
      
      // Clear state regardless of error
      set({
        user: null,
        session: null,
        loading: false,
        redirectIntent: null,
        authMode: 'login',
      })
      
    } catch (error: any) {
      console.error('[useAuth] Unexpected logout error:', error)
      set({
        user: null,
        session: null,
        loading: false,
        redirectIntent: null,
        authMode: 'login',
      })
    }
  },

  // Refresh session manually
  refreshSession: async (): Promise<void> => {
    try {
      console.log('[useAuth] Refreshing session')
      
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('[useAuth] Session refresh error:', error)
        set({ user: null, session: null })
        return
      }

      if (data.session) {
        console.log('[useAuth] Session refreshed successfully')
        set({ user: data.session.user, session: data.session })
      }
      
    } catch (error: any) {
      console.error('[useAuth] Unexpected session refresh error:', error)
    }
  },
}
});
