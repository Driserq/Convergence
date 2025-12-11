import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

interface SubscriptionSummary {
  planCode: 'free' | 'weekly' | 'monthly'
  planName: string
  isActive: boolean
  usage?: {
    limit: number
    used: number
  }
}

const emailSchema = z.object({
  email: z.string().email('Invalid email address')
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine(values => values.newPassword === values.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

type EmailFormValues = z.infer<typeof emailSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export const Profile: React.FC = () => {
  const { user, session, logout } = useAuth()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null)
  const [subLoading, setSubLoading] = useState(true)

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || ''
    }
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    if (user) {
      emailForm.reset({ email: user.email || '' })
      fetchSubscription()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchSubscription = async () => {
    if (!session?.access_token) {
      setSubLoading(false)
      return
    }
    try {
      const res = await fetch('/api/subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setSubscription(data.subscription)
      } else {
        setMessage({ type: 'error', text: data.error || 'Unable to load subscription' })
      }
    } catch (error) {
      console.error('[Profile] Failed to load subscription:', error)
      setMessage({ type: 'error', text: 'Failed to load subscription information' })
    } finally {
      setSubLoading(false)
    }
  }

  const onUpdateEmail = async (values: EmailFormValues) => {
    if (values.email === user?.email) {
      setMessage({ type: 'success', text: 'Email is already up to date.' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ email: values.email })
      if (error) throw error

      setMessage({ type: 'success', text: 'Email updated. Check your inbox to confirm the new address.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to update email' })
    } finally {
      setIsLoading(false)
    }
  }

  const onUpdatePassword = async (values: PasswordFormValues) => {
    if (!user?.email) {
      setMessage({ type: 'error', text: 'Unable to update password for this account.' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      const { error } = await supabase.auth.updateUser({ password: values.newPassword })
      if (error) throw error

      setMessage({ type: 'success', text: 'Password updated successfully.' })
      passwordForm.reset()
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to update password' })
    } finally {
      setIsLoading(false)
    }
  }

  const onCancelSubscription = async () => {
    if (!session?.access_token) return
    setIsLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/subscription/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ planCode: 'free' })
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }
      setSubscription(data.subscription)
      setMessage({ type: 'success', text: 'Subscription cancelled successfully.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to cancel subscription' })
    } finally {
      setIsLoading(false)
    }
  }

  const onDeleteAccount = async () => {
    if (!session?.access_token) return
    setIsLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete account')
      }
      await logout()
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to delete account' })
      setIsLoading(false)
    }
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-foreground">Profile & Settings</h1>
            <p className="mt-2 text-muted-foreground">Manage your account details, subscription, and preferences.</p>
          </header>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="animate-in fade-in slide-in-from-top-2">
              {message.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
              <AlertTitle>{message.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Card className="border-border/50 bg-card/70">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-lg text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your contact email and password.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="email">
                  <AccordionTrigger>Change Email</AccordionTrigger>
                  <AccordionContent>
                    <form onSubmit={emailForm.handleSubmit(onUpdateEmail)} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...emailForm.register('email')} />
                        {emailForm.formState.errors.email && (
                          <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Update Email
                        </Button>
                      </div>
                    </form>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="password">
                  <AccordionTrigger>Change Password</AccordionTrigger>
                  <AccordionContent>
                    <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/70">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your plan and usage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-4">
                <div>
                  <p className="font-medium text-foreground">Current Plan</p>
                  {subLoading ? (
                    <div className="mt-1 h-4 w-24 animate-pulse rounded bg-muted" />
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={subscription?.planCode === 'free' ? 'secondary' : 'default'}>
                        {subscription?.planName || 'Free'}
                      </Badge>
                      {subscription?.isActive && (
                        <span className="flex items-center gap-1 text-sm text-green-500">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {!subLoading && subscription?.planCode !== 'free' ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">Cancel Subscription</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will keep access until the end of your billing period. After that, premium features will be disabled.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                        <AlertDialogAction onClick={onCancelSubscription}>Confirm Cancellation</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button variant="default" size="sm" onClick={() => window.location.href = '/plans'}>
                    Upgrade Plan
                  </Button>
                )}
              </div>

              {subscription?.usage && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                    <p className="text-sm text-muted-foreground">Blueprint limit</p>
                    <p className="text-2xl font-semibold">
                      {subscription.usage.limit === -1 ? '∞' : subscription.usage.limit}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                    <p className="text-sm text-muted-foreground">Blueprints created</p>
                    <p className="text-2xl font-semibold">{subscription.usage.used}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>This action permanently deletes your account and associated data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Once deleted, your account and habit data cannot be recovered.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All of your blueprints, history, and account information will be deleted permanently.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDeleteAccount}>Delete Account</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}