import React, { useMemo } from 'react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../src/components/ui/alert-dialog'

export const VerifyEmail: React.FC = () => {
  const displayEmail = useMemo(() => {
    if (typeof window === 'undefined') return 'your inbox'
    const params = new URLSearchParams(window.location.search)
    const value = params.get('email')?.trim()
    return value || 'your inbox'
  }, [])

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
          <p className="text-sm text-muted-foreground">
            Didn’t receive anything? Check spam or send again after a few minutes.
          </p>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
