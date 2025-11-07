import React, { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'
type AuthMode = 'login' | 'signup'

export const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')

  // Auth is initialized globally in App.tsx

  // Auth state is now handled in App.tsx
  // This component only renders for unauthenticated users

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* App header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Convergence</h1>
          <p className="text-lg text-muted-foreground">Transform content into actionable habit blueprints</p>
        </div>

        {/* Auth forms */}
        {mode === 'login' ? (
          <LoginForm onSwitchToSignup={() => setMode('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setMode('login')} />
        )}

        {/* Footer */}
        <div className="mt-8 text-center space-y-3">
          <a
            href="/"
            className="text-primary hover:text-primary/80 text-sm underline block"
          >
            ← Back to Home
          </a>
          <p className="text-sm text-muted-foreground">
            Phase 2: Authentication Flow - MVP Development
          </p>
        </div>
      </div>
    </div>
  )
}