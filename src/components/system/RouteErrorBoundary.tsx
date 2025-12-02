import React from 'react'
import { Button } from '../ui/button'

interface RouteErrorBoundaryProps {
  children: React.ReactNode
}

interface RouteErrorBoundaryState {
  hasError: boolean
  errorMessage?: string
}

const RECOVERABLE_ERROR_PATTERNS = [
  /Loading chunk \d+ failed/i,
  /ChunkLoadError/i,
  /Failed to fetch dynamically imported module/i,
  /dynamically imported module was not found/i,
]

const isRecoverableAssetError = (error?: Error): boolean => {
  if (!error?.message) {
    return false
  }
  return RECOVERABLE_ERROR_PATTERNS.some((pattern) => pattern.test(error.message))
}

export class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError (error: Error): RouteErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    }
  }

  componentDidCatch (error: Error, errorInfo: React.ErrorInfo) {
    console.error('[RouteErrorBoundary] Error:', error, errorInfo)

    if (isRecoverableAssetError(error) && typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: undefined })
  }

  render () {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Something went wrong loading this view.</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.errorMessage || 'Please reload to continue.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="default" onClick={this.handleReload}>
                Reload app
              </Button>
              <Button variant="outline" onClick={this.handleRetry}>
                Try again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
