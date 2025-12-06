import React, { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { useRouteParams, useRouter } from '../contexts/RouterContext'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'

export const VerifyEmail: React.FC = () => {
  const params = useRouteParams<'verifyEmail'>()
  const { resendVerificationEmail, user } = useAuth()
  const { navigate } = useRouter()
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    const isVerified = Boolean(user?.email_confirmed_at ?? user?.confirmed_at)
    if (isVerified) {
      navigate('dashboard')
    }
  }, [navigate, user])

  const displayEmail = useMemo(() => {
    const cleaned = params?.email?.trim() || user?.email?.trim()
    if (!cleaned) return 'your inbox'
    return cleaned
  }, [params, user])

  const resendEmail = useMemo(() => {
    const cleaned = params?.email?.trim() || user?.email?.trim()
    return cleaned || ''
  }, [params, user])

  useEffect(() => {
    if (!cooldown) return
    const interval = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  const handleResend = async () => {
    if (!resendEmail || isResending || cooldown > 0) {
      return
    }

    setIsResending(true)
    setFeedback(null)
    const result = await resendVerificationEmail(resendEmail)
    setIsResending(false)

    if (!result.success && result.error) {
      setFeedback({ type: 'error', message: result.error.message })
      return
    }

    setFeedback({ type: 'success', message: 'Verification email sent again. Check your inbox shortly.' })
    setCooldown(30)
  }

  return (
    <div className="min-h-screen bg-background">
      <AlertDialog open>
        <AlertDialogContent className="sm:max-w-md text-center space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Verify your email</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed text-muted-foreground">
              We sent a verification email to{' '}
              <span className="font-medium text-foreground">{displayEmail}</span>. Head to your inbox and click the link to
              finish setting up your Consum account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Didn’t receive anything? Check spam or request another email.</p>
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-11 text-base"
                disabled={!resendEmail || isResending || cooldown > 0}
                onClick={handleResend}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : cooldown > 0 ? (
                  `Try again in ${cooldown}s`
                ) : (
                  'Resend verification email'
                )}
              </Button>
              {!resendEmail && (
                <p className="text-xs text-destructive">
                  We need the email you signed up with to resend the verification link.
                </p>
              )}
            </div>
            {feedback && (
              <p
                className={`text-sm ${
                  feedback.type === 'success' ? 'text-emerald-600' : 'text-destructive'
                }`}
              >
                {feedback.message}
              </p>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
