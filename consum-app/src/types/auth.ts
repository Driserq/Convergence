import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'
import type { RouteName, RouteParams } from '../routes/map.js'

// Extend Supabase types if needed
export type User = SupabaseUser
export type Session = SupabaseSession

// Auth form types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
}

export type AuthMode = 'login' | 'signup'

export interface RedirectIntent<Name extends RouteName = RouteName> {
  name: Name
  params: RouteParams<Name>
}

// Error structure matching Supabase format
export interface AuthError {
  message: string
  status?: number
}

// Auth state with session tracking
export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  authMode: AuthMode
  setAuthMode: (mode: AuthMode) => void
  redirectIntent: RedirectIntent | null
  setRedirectIntent: (intent: RedirectIntent | null) => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>
  signup: (
    email: string,
    password: string,
    options?: { emailRedirectTo?: string }
  ) => Promise<{ success: boolean; error?: AuthError }>
  resendVerificationEmail: (
    email: string,
    options?: { emailRedirectTo?: string }
  ) => Promise<{ success: boolean; error?: AuthError }>
  signInWithGoogle: (
    options?: { redirectTo?: string }
  ) => Promise<{ success: boolean; error?: AuthError }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  initialize: () => Promise<void>
}

// Auth response types
export interface AuthResponse {
  success: boolean
  error?: AuthError
}