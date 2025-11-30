import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import type { LoginFormData } from '../../types/auth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Separator } from '../ui/separator'
import { GoogleAuthButton } from './GoogleAuthButton'

interface LoginFormProps {
  onSwitchToSignup?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { login, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setIsLoading(true)
      const result = await login(formData.email, formData.password)
      if (!result.success && result.error) {
        setError(result.error.message)
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in right now')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError(null)
  }

  const disabled = isLoading || authLoading
  const handleOAuthError = (message: string) => {
    setError(message)
  }

  const handleSwitchToSignup = () => {
    if (onSwitchToSignup) {
      onSwitchToSignup()
      return
    }
    window.location.href = '/signup'
  }

  return (
    <Card className="border-border/50 bg-card/70 shadow-xl">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to continue building your habit blueprint.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to sign in</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>
          <Button type="submit" className="w-full" disabled={disabled}>
            {disabled ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
        <div className="py-5">
          <div className="relative py-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/70 px-2 text-xs uppercase tracking-wide text-muted-foreground">
              or
            </span>
          </div>
          <GoogleAuthButton label="Log in with Google" onError={handleOAuthError} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 text-center text-sm text-muted-foreground">
        <span>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={handleSwitchToSignup}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </button>
        </span>
      </CardFooter>
    </Card>
  )
}