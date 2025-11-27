import React, { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '../ui/button'

export const ServiceWorkerToast: React.FC = () => {
  const [dismissed, setDismissed] = useState(false)
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered (registration) {
      console.log('[PWA] Service worker registered', registration?.scope)
    },
    onRegisterError (error) {
      console.error('[PWA] Service worker registration failed:', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
    setDismissed(true)
  }

  if ((!offlineReady && !needRefresh) || dismissed) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 md:bottom-6">
      <div className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {offlineReady ? 'Offline ready' : 'New version available'}
            </p>
            <p className="text-xs text-muted-foreground">
              {offlineReady
                ? 'You can now use Convergence offline with previously cached blueprints.'
                : 'Reload to apply the latest performance improvements.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {needRefresh && (
              <Button size="sm" onClick={() => updateServiceWorker(true)}>
                Refresh
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={close}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
