import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'
import { useAuth } from '../hooks/useAuth'

const feedbackSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(500, 'Maximum 500 characters')
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

const FRIENDLY_FAILURE = 'Uh-oh, something went down. Could you save this and try again or email me directly at kuba@consum.app'

export const Feedback: React.FC = () => {
  const { session, user } = useAuth()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [remainingSubmissions, setRemainingSubmissions] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { message: '' }
  })

  const remainingCharacters = 500 - ((form.watch('message') ?? '').length)

  const handleSubmit = async (values: FeedbackFormValues) => {
    if (!session?.access_token) {
      setStatus({ type: 'error', message: 'Please sign in again to send feedback.' })
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message: values.message.trim() })
      })

      let data: { success?: boolean; error?: string; remaining?: number } | null = null

      try {
        data = await response.json()
      } catch (parseError) {
        console.error('[Feedback] Response parse failed:', parseError)
      }

      if (!response.ok || !data?.success) {
        const errorMessage = data?.error || FRIENDLY_FAILURE
        setStatus({ type: 'error', message: errorMessage })
        return
      }

      setRemainingSubmissions(typeof data.remaining === 'number' ? data.remaining : null)
      setStatus({ type: 'success', message: 'Thanks! Your feedback has been sent.' })
      form.reset({ message: '' })
    } catch (error) {
      console.error('[Feedback] Submission failed:', error)
      setStatus({ type: 'error', message: FRIENDLY_FAILURE })
    } finally {
      setIsSubmitting(false)
    }
  }

  const helperCopy = useMemo(() => {
    if (!user?.email) {
      return 'Only verified users can send feedback, up to 10 submissions every 24 hours.'
    }

    if (remainingSubmissions === null) {
      return 'You can send up to 10 feedback messages every 24 hours.'
    }

    return `You can send up to 10 feedback messages every 24 hours. ${remainingSubmissions} left today.`
  }, [remainingSubmissions, user?.email])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <header className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">We read everything</p>
            <h1 className="text-3xl font-bold text-foreground">Feedback</h1>
            <p className="text-base text-muted-foreground">
              Share what’s working, what’s confusing, or what you absolutely need next. Messages go straight to Kuba.
            </p>
          </header>

          {status && (
            <Alert
              variant={status.type === 'error' ? 'destructive' : 'default'}
              className="border border-border/70 bg-background/80"
              role="status"
              aria-live="polite"
            >
              {status.type === 'error' ? (
                <AlertTriangle className="h-4 w-4" aria-hidden />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden />
              )}
              <AlertTitle>{status.type === 'error' ? 'Something went wrong' : 'Feedback sent'}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          <Card className="border-border/60 bg-card/80 shadow-xl">
            <CardHeader>
              <CardTitle>Send a quick note</CardTitle>
              <p className="text-sm text-muted-foreground">{helperCopy}</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={6}
                            placeholder="Thanks for building Consum..."
                            disabled={isSubmitting}
                            maxLength={500}
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific so we can act quickly. Examples: “The dashboard loads slowly on iOS” or “Bulk habit edit would save me an hour a week.”
                        </FormDescription>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Max 500 characters • 10 submissions / 24h</span>
                          <span className={remainingCharacters <= 50 ? 'font-semibold text-amber-400' : 'text-muted-foreground'}>
                            {remainingCharacters} / 500
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting || !session?.access_token} className="w-full" size="lg">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                    Send feedback
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
