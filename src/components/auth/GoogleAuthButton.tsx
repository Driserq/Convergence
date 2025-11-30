import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'

interface GoogleAuthButtonProps {
  label?: string
  redirectTo?: string
  onError?: (message: string) => void
}

const DEFAULT_LABEL = 'Continue with Google'

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = DEFAULT_LABEL,
  redirectTo,
  onError,
}) => {
  const { signInWithGoogle, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true)
      const result = await signInWithGoogle(redirectTo ? { redirectTo } : undefined)

      if (!result.success) {
        setIsSubmitting(false)
        onError?.(result.error?.message || 'Unable to continue with Google right now.')
      }
    } catch (error) {
      console.error('[GoogleAuthButton] Error starting Google OAuth:', error)
      setIsSubmitting(false)
      onError?.('Unable to continue with Google right now.')
    }
  }

  const disabled = loading || isSubmitting

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={handleGoogleSignIn}
      disabled={disabled}
    >
      {isSubmitting ? (
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
      ) : (
        <GoogleGlyph />
      )}
      {isSubmitting ? 'Redirecting…' : label}
    </Button>
  )
}

const GoogleGlyph: React.FC = () => (
  <svg
    aria-hidden
    width="18"
    height="18"
    viewBox="0 0 48 48"
    className="shrink-0"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6 1.54 7.38 2.83l5.42-5.42C33.64 3.58 29.24 2 24 2 14.82 2 6.81 7.98 3.44 16.09l6.9 5.36C12.05 14.02 17.52 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.57-.14-3.18-.41-4.71H24v9.02h12.7c-.55 2.96-2.26 5.46-4.81 7.14l7.54 5.86C43.86 38.59 46.5 32.09 46.5 24.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.34 28.45a14.5 14.5 0 0 1-.76-4.45c0-1.55.27-3.05.74-4.45L3.44 14.2A22.443 22.443 0 0 0 1.5 24c0 3.58.85 6.96 2.36 9.94l6.48-5.49z"
    />
    <path
      fill="#34A853"
      d="M24 46c6.24 0 11.47-2.06 15.29-5.61l-7.54-5.86c-2.1 1.41-4.79 2.25-7.75 2.25-6.48 0-11.94-4.51-13.66-10.66l-6.9 5.36C6.81 40.02 14.82 46 24 46z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
)
