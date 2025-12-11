import React, { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSubscription } from '../src/hooks/useSubscription'
import { Button } from '../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../src/components/ui/card'

export const BillingSuccess: React.FC = () => {
  const navigate = useNavigate()
  const { data, refresh, isLoading } = useSubscription()
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const verifySubscription = async () => {
      // Wait a bit for the webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000))
      await refresh()
      setVerifying(false)
    }

    verifySubscription()
  }, [refresh])

  const planName = data?.planName || 'Pro'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            {verifying ? (
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {verifying ? 'Finalizing Subscription...' : 'Payment Successful!'}
          </CardTitle>
          <CardDescription className="text-lg">
            {verifying
              ? 'Please wait while we confirm your payment details.'
              : `You are now subscribed to the ${planName} plan.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            {verifying
              ? 'This typically takes just a few seconds.'
              : 'Thank you for upgrading. Your new limits are active immediately.'}
          </p>
          
          <Button 
            size="lg" 
            className="w-full rounded-full font-semibold"
            onClick={() => navigate('/dashboard')}
            disabled={verifying}
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
