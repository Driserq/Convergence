import React, { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import type { SignupFormData } from '../../types/auth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Separator } from '../ui/separator'
import { GoogleAuthButton } from './GoogleAuthButton'

interface SignupFormProps {
  onSwitchToLogin: () => void
  onSignupSuccess?: (email: string) => void
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const { signup, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setIsLoading(true)
      const result = await signup(formData.email, formData.password)
      if (!result.success && result.error) {
        setError(result.error.message)
      } else {
        if (onSignupSuccess) {
          onSignupSuccess(formData.email)
        } else {
          const encodedEmail = encodeURIComponent(formData.email)
          window.location.href = `/verify-email?email=${encodedEmail}`
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to sign up right now')
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

  const handleOAuthError = (message: string) => {
    setError(message)
  }

  const disabled = isLoading || authLoading
  const handleSwitchToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin()
      return
    }
    window.location.href = '/login'
  }

  return (
    <Card className="border-border/50 bg-card/70 shadow-xl">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start transforming content into actionable habits.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to sign up</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-confirm">Confirm Password</Label>
            <Input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>
          <Button type="submit" className="w-full" disabled={disabled}>
            {disabled ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
            ) : (
              'Create Account'
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
          <GoogleAuthButton label="Sign up with Google" onError={handleOAuthError} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 text-center text-sm text-muted-foreground">
        <span>
          Already a member?{' '}
          <button
            type="button"
            onClick={handleSwitchToLogin}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </button>
        </span>
      </CardFooter>
    </Card>
  )
}