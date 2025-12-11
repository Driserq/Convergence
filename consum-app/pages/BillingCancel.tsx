import React from 'react'
import { XCircle } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../src/components/ui/card'

export const BillingCancel: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Checkout Canceled
          </CardTitle>
          <CardDescription className="text-lg">
            No charges were made to your card.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            If you encountered an issue or changed your mind, you can try upgrading again anytime from the dashboard.
          </p>
          
          <Button 
            size="lg" 
            variant="secondary"
            className="w-full rounded-full font-semibold"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
