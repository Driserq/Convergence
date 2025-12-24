import React, { useState, useMemo } from 'react'
import { Loader2, AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Textarea } from '../ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { useAuth } from '../../hooks/useAuth'

const feedbackSchema = z.object({
  message: z.string().trim().min(1, 'Note is required').max(500, 'Maximum 500 characters')
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

interface RateBlueprintDialogProps {
  blueprintId: string
}

const FRIENDLY_FAILURE = 'Uh-oh, something went down. Could you try again or email me directly at kuba@consum.app?'

export const RateBlueprintDialog: React.FC<RateBlueprintDialogProps> = ({ blueprintId }) => {
  const { session, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { message: '' }
  })

  const remainingCharacters = 500 - ((form.watch('message') ?? '').length)

  const helperCopy = useMemo(() => {
    if (!user?.email) {
      return 'Only verified users can send feedback. Limited to 10 submissions every 24 hours.'
    }
    return 'Share a quick note about this blueprint. 10 submissions every 24 hours.'
  }, [user?.email])

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
        body: JSON.stringify({
          message: values.message.trim(),
          blueprintId
        })
      })

      let data: { success?: boolean; error?: string } | null = null

      try {
        data = await response.json()
      } catch (parseError) {
        console.error('[RateBlueprintDialog] Response parse failed:', parseError)
      }

      if (!response.ok || !data?.success) {
        const errorMessage = data?.error || FRIENDLY_FAILURE
        setStatus({ type: 'error', message: errorMessage })
        return
      }

      setStatus({ type: 'success', message: 'Thanks! Your note has been sent.' })
      form.reset({ message: '' })
      setTimeout(() => {
        setIsOpen(false)
        setStatus(null)
      }, 1500)
    } catch (error) {
      console.error('[RateBlueprintDialog] Submission failed:', error)
      setStatus({ type: 'error', message: FRIENDLY_FAILURE })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        setStatus(null)
        form.reset({ message: '' })
      }
    }}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          disabled={!session?.access_token}
        >
          Rate this blueprint
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="size-4 text-primary" aria-hidden />
            Leave a quick note
          </DialogTitle>
          <DialogDescription>{helperCopy}</DialogDescription>
        </DialogHeader>

        {status && (
          <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className="border border-border/70 bg-background/80">
            {status.type === 'error' ? (
              <AlertTriangle className="h-4 w-4" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden />
            )}
            <AlertTitle>{status.type === 'error' ? 'Something went wrong' : 'Thanks!'}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="What stood out about this blueprint?"
                      maxLength={500}
                      disabled={isSubmitting}
                      className="bg-background text-foreground border-border"
                    />
                  </FormControl>
                  <div className="text-right text-xs text-muted-foreground">
                    {remainingCharacters} / 500
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !session?.access_token}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Send note
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
