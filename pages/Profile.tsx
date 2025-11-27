import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../src/lib/supabase'
import { useAuth } from '../src/hooks/useAuth'
import { ProtectedRoute } from '../src/components/auth/ProtectedRoute'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../src/components/ui/card'
import { Button } from '../src/components/ui/button'
import { Input } from '../src/components/ui/input'
import { Label } from '../src/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '../src/components/ui/avatar'
import { Badge } from '../src/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../src/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '../src/components/ui/alert'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../src/components/ui/accordion'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

// --- Schemas ---
const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type EmailFormValues = z.infer<typeof emailSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

// --- Component ---
export const Profile: React.FC = () => {
  const { user, logout, session } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Subscription State
  const [subLoading, setSubLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (user) {
      emailForm.reset({
        email: user.email || '',
      })
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })
      const data = await res.json()
      if (data.success) {
        setSubscription(data.subscription)
      }
    } catch (err) {
      console.error('Failed to fetch subscription', err)
    } finally {
      setSubLoading(false)
    }
  }

  // Handle Email Update
  const onUpdateEmail = async (values: EmailFormValues) => {
    if (values.email === user?.email) return
    
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ email: values.email })
      if (error) throw error

      setMessage({ type: 'success', text: 'Email updated. Please check your new email for a confirmation link.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update email' })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Password Update
  const onUpdatePassword = async (values: PasswordFormValues) => {
    setIsLoading(true)
    setMessage(null)

    try {
      // First verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: values.currentPassword
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword
      })

      if (updateError) throw updateError

      setMessage({ type: 'success', text: 'Password updated successfully.' })
      passwordForm.reset()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Subscription Cancel
  const onCancelSubscription = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/subscription/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ planCode: 'free' })
      })
      
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setSubscription(data.subscription)
      setMessage({ type: 'success', text: 'Subscription cancelled successfully.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Account Delete
  const onDeleteAccount = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })
      
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      await logout()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account' })
      setIsLoading(false)
    }
  }

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile & Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'border-green-500/50 text-green-500' : ''}>
              {message.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{message.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Account Section */}
          <Card className="border-border/50 bg-card/70">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your email and security settings.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                
                {/* Change Email */}
                <AccordionItem value="email">
                  <AccordionTrigger>Change Email</AccordionTrigger>
                  <AccordionContent>
                    <form onSubmit={emailForm.handleSubmit(onUpdateEmail)} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">New Email Address</Label>
                        <Input {...emailForm.register('email')} id="email" type="email" />
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

                {/* Change Password */}
                <AccordionItem value="password">
                  <AccordionTrigger>Change Password</AccordionTrigger>
                  <AccordionContent>
                    <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input {...passwordForm.register('currentPassword')} id="currentPassword" type="password" />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input {...passwordForm.register('newPassword')} id="newPassword" type="password" />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input {...passwordForm.register('confirmPassword')} id="confirmPassword" type="password" />
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

          {/* Subscription Section */}
          <Card className="border-border/50 bg-card/70">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your billing and plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                <div>
                  <p className="font-medium">Current Plan</p>
                  {subLoading ? (
                    <div className="h-4 w-20 bg-muted animate-pulse rounded mt-1" />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                       <Badge variant={subscription?.planCode === 'free' ? 'secondary' : 'default'}>
                        {subscription?.planName || 'Free'}
                      </Badge>
                      {subscription?.isActive && <span className="text-sm text-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3"/> Active</span>}
                    </div>
                  )}
                </div>
                {!subLoading && subscription?.planCode !== 'free' && (
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">Cancel Subscription</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will lose access to premium features at the end of your current billing period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={onCancelSubscription} 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Confirm Cancellation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {!subLoading && subscription?.planCode === 'free' && (
                  <Button variant="default" size="sm" onClick={() => window.location.href = '/plans'}>
                    Upgrade Plan
                  </Button>
                )}
              </div>
              
              {subscription?.usage && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">Habits Limit</p>
                    <p className="text-2xl font-bold">{subscription.usage.limit === -1 ? '∞' : subscription.usage.limit}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">Blueprints Created</p>
                    <p className="text-2xl font-bold">{subscription.usage.used}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={onDeleteAccount} 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
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
