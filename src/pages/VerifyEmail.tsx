import React, { useMemo } from 'react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { useRouteParams } from '../contexts/RouterContext'

export const VerifyEmail: React.FC = () => {
  const params = useRouteParams<'verifyEmail'>()

  const displayEmail = useMemo(() => {
    const cleaned = params?.email?.trim()
    if (!cleaned) return 'your inbox'
    return cleaned
  }, [params])

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
