import React from 'react'
import { LoginForm } from '../src/components/auth/LoginForm'
import { SignupForm } from '../src/components/auth/SignupForm'
import { useAuth } from '../src/hooks/useAuth'

export const Login: React.FC = () => {
  const { authMode, setAuthMode } = useAuth()

  // Auth is initialized globally in App.tsx

  // Auth state is now handled in App.tsx
  // This component only renders for unauthenticated users

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* App header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Consum</h1>
          <p className="text-lg text-muted-foreground">Transform content into actionable habit blueprints</p>
        </div>

        {/* Auth forms */}
        {authMode === 'login' ? (
          <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
        )}

        {/* Footer */}
        <div className="mt-8 text-center space-y-3">
          <a
            href="/"
            className="text-primary hover:text-primary/80 text-sm underline block"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}