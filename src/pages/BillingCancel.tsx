import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useRouter } from '../contexts/RouterContext'

export const BillingCancel: React.FC = () => {
  const { navigate } = useRouter()

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <AlertTriangle className="size-8 text-amber-500" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Checkout canceled</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          We didn’t complete any changes to your subscription. You can revisit the plans page whenever
          you’re ready to switch or upgrade.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate('plans')} className="rounded-full px-6">
            Return to plans
          </Button>
          <Button variant="outline" onClick={() => navigate('dashboard')} className="rounded-full px-6">
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
