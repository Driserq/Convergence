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

export const useAuth = create<AuthState>((set, get) => ({
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
      set({ loading: true })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[useAuth] Login error:', error)
        set({ loading: false })
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status || 400
          }
        }
      }

      console.log('[useAuth] Login successful for user:', data.user.email)
      set({ user: data.user, session: data.session, loading: false })
      
      return { success: true }
      
    } catch (error: any) {
      console.error('[useAuth] Unexpected login error:', error)
      set({ loading: false })
      return {
        success: false,
        error: {
          message: error?.message || 'An unexpected error occurred during login'
        }
      }
    }
  },

  // Signup with email and password
  signup: async (email: string, password: string) => {
    try {
      console.log('[useAuth] Attempting signup for:', email)
      set({ loading: true })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error('[useAuth] Signup error:', error)
        set({ loading: false })
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
        set({ user: data.user, session: data.session, loading: false })
      } else {
        set({ loading: false })
      }
      
      return { success: true }
      
    } catch (error: any) {
      console.error('[useAuth] Unexpected signup error:', error)
      set({ loading: false })
      return {
        success: false,
        error: {
          message: error?.message || 'An unexpected error occurred during signup'
        }
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
  }
}))