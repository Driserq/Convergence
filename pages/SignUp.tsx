import React, { useEffect } from 'react'

import { SignupForm } from '../src/components/auth/SignupForm'
import { useAuth } from '../src/hooks/useAuth'

export const SignUp: React.FC = () => {
  const { setAuthMode } = useAuth()

  useEffect(() => {
    setAuthMode('signup')
  }, [setAuthMode])

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Join Consum</h1>
          <p className="text-lg text-muted-foreground">
            Create an account to turn every video into an actionable habit blueprint.
          </p>
        </div>

        <SignupForm
          onSwitchToLogin={() => {
            window.location.href = '/login'
          }}
          onSignupSuccess={(email) => {
            window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
          }}
        />

        <div className="mt-8 text-center space-y-3 text-sm">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/login'
            }}
            className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
          >
            Already have an account? Log in
          </button>
          <a
            href="/"
            className="block text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
