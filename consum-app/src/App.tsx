import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Navigation } from './components/ui/Navigation'
import { ServiceWorkerToast } from './components/system/ServiceWorkerToast'
import { RouteErrorBoundary } from './components/system/RouteErrorBoundary'
import { RouterProvider } from './contexts/RouterContext'
import {
  isProtectedRoute,
  resolveRoute,
  routeDictionary,
  type RouteName,
  type RouteArgs,
  type NavigateFn,
  type RouteMatch,
} from './routes/map'
const LoginPage = lazy(async () => ({ default: (await import('./pages/Login')).Login }))
const SignUpPage = lazy(async () => ({ default: (await import('./pages/SignUp')).SignUp }))
const DashboardPage = lazy(async () => ({ default: (await import('./pages/Dashboard')).Dashboard }))
const HistoryPage = lazy(async () => ({ default: (await import('./pages/History')).History }))
const CreateBlueprintPage = lazy(async () => ({ default: (await import('./pages/CreateBlueprint')).CreateBlueprint }))
const BlueprintDetailPage = lazy(async () => ({ default: (await import('./pages/BlueprintDetail')).BlueprintDetail }))
const ProfilePage = lazy(async () => ({ default: (await import('./pages/Profile')).Profile }))
const PlansPage = lazy(async () => ({ default: (await import('./pages/Plans')).Plans }))
const BillingSuccessPage = lazy(async () => ({ default: (await import('./pages/BillingSuccess')).BillingSuccess }))
const BillingCancelPage = lazy(async () => ({ default: (await import('./pages/BillingCancel')).BillingCancel }))
const NotFoundPage = lazy(async () => ({ default: (await import('./pages/NotFound')).NotFound }))
const VerifyEmailPage = lazy(async () => ({ default: (await import('./pages/VerifyEmail')).VerifyEmail }))
const FeedbackPage = lazy(async () => ({ default: (await import('./pages/Feedback')).Feedback }))

type BrowserWindow = {
  location: {
    pathname: string
    origin: string
  }
  history: {
    pushState: (data: unknown, unused: string, url?: string) => void
  }
  addEventListener: (type: string, listener: (event: unknown) => void) => void
  removeEventListener: (type: string, listener: (event: unknown) => void) => void
}

type BrowserDocument = {
  documentElement?: {
    classList?: {
      add?: (...tokens: string[]) => void
    }
  }
  addEventListener: (type: string, listener: (event: unknown) => void) => void
  removeEventListener: (type: string, listener: (event: unknown) => void) => void
}

const getBrowserWindow = (): BrowserWindow | undefined => {
  if (typeof globalThis === 'undefined') return undefined
  const globalWithWindow = globalThis as typeof globalThis & { window?: unknown }
  const maybeWindow = globalWithWindow.window
  if (maybeWindow && typeof maybeWindow === 'object') {
    return maybeWindow as BrowserWindow
  }
  return undefined
}

const getBrowserDocument = (): BrowserDocument | undefined => {
  if (typeof globalThis === 'undefined') return undefined
  const globalWithDocument = globalThis as typeof globalThis & { document?: unknown }
  const maybeDocument = globalWithDocument.document
  if (maybeDocument && typeof maybeDocument === 'object') {
    return maybeDocument as BrowserDocument
  }
  return undefined
}

const SuspenseFallback: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
  </div>
)

export const App: React.FC = () => {
  const {
    user,
    loading,
    initialize,
    authMode,
    setAuthMode,
    redirectIntent,
    setRedirectIntent,
  } = useAuth()
  const isEmailVerified = useMemo(
    () => Boolean(user?.email_confirmed_at ?? user?.confirmed_at),
    [user]
  )
  const [currentRoute, setCurrentRoute] = useState<RouteMatch>(() => {
    const win = getBrowserWindow()
    const initialPath = win?.location.pathname ?? '/'
    return resolveRoute(initialPath)
  })

  const applyRoute = useCallback((path: string, shouldPush: boolean) => {
    setCurrentRoute(prev => {
      if (path === prev.path) {
        return prev
      }
      const nextRoute = resolveRoute(path)
      if (shouldPush) {
        const win = getBrowserWindow()
        win?.history.pushState({}, '', nextRoute.path)
      }
      return nextRoute
    })
  }, [])

  const navigate = useCallback(<Name extends RouteName>(name: Name, ...args: RouteArgs<Name>) => {
    const record = routeDictionary[name]
    const path = record.buildPath(...args)
    applyRoute(path, true)
  }, [applyRoute]) as NavigateFn

  // Initialize auth globally - this ensures we only have one auth listener
  useEffect(() => {
    console.log('[App] Initializing auth globally...')
    initialize()
  }, [initialize])

  useEffect(() => {
    const doc = getBrowserDocument()
    doc?.documentElement?.classList?.add?.('dark')
  }, [])

  // Handle browser back/forward navigation
  useEffect(() => {
    const win = getBrowserWindow()
    if (!win) return

    const handlePopState = () => {
      applyRoute(win.location.pathname, false)
    }

    win.addEventListener('popstate', handlePopState)
    return () => win.removeEventListener('popstate', handlePopState)
  }, [applyRoute])

  // Intercept link clicks for client-side navigation
  useEffect(() => {
    const win = getBrowserWindow()
    const doc = getBrowserDocument()
    if (!win || !doc) return

    type AnchorCandidate = {
      tagName?: string
      href?: string
      hasAttribute?: (name: string) => boolean
      closest?: (selector: string) => AnchorCandidate | null
    }

    const resolveAnchor = (target: unknown): AnchorCandidate | null => {
      if (!target || typeof target !== 'object') return null
      const candidate = target as AnchorCandidate
      if (typeof candidate.tagName === 'string' && candidate.tagName.toUpperCase() === 'A') {
        return candidate
      }
      if (typeof candidate.closest === 'function') {
        return candidate.closest('a')
      }
      return null
    }

    const handleLinkClick = (event: unknown) => {
      const clickEvent = event as { target?: unknown; preventDefault?: () => void }
      const anchor = resolveAnchor(clickEvent.target)

      if (
        !anchor ||
        typeof anchor.href !== 'string' ||
        !anchor.href.startsWith(win.location.origin) ||
        (typeof anchor.hasAttribute === 'function' && anchor.hasAttribute('target'))
      ) {
        return
      }

      clickEvent.preventDefault?.()
      const path = anchor.href.slice(win.location.origin.length) || '/'
      applyRoute(path, true)
    }

    doc.addEventListener('click', handleLinkClick)
    return () => doc.removeEventListener('click', handleLinkClick)
  }, [applyRoute])

  useEffect(() => {
    if (loading) return

    const routeRequiresAuth = isProtectedRoute(currentRoute.name)

    if (!user) {
      if (routeRequiresAuth) {
        if (!redirectIntent || redirectIntent.name !== currentRoute.name) {
          setRedirectIntent({
            name: currentRoute.name,
            params: currentRoute.params as any,
          })
        }
        if (authMode !== 'signup') {
          setAuthMode('signup')
        }
        if (currentRoute.name !== 'login') {
          navigate('login')
        }
      }
      if (currentRoute.name === 'login' && !routeRequiresAuth && !redirectIntent && authMode !== 'login') {
        setAuthMode('login')
      }
      return
    }

    if (!isEmailVerified) {
      if (currentRoute.name !== 'verifyEmail') {
        if (!redirectIntent || redirectIntent.name !== currentRoute.name) {
          setRedirectIntent({
            name: currentRoute.name,
            params: currentRoute.params as any,
          })
        }
        navigate('verifyEmail', {
          email: user.email ?? (currentRoute.params as any)?.email,
        })
      }
      return
    }

    if (redirectIntent) {
      navigate(redirectIntent.name, redirectIntent.params as any)
      setRedirectIntent(null)
      if (authMode !== 'login') {
        setAuthMode('login')
      }
      return
    }

    if (currentRoute.name === 'verifyEmail') {
      navigate('dashboard')
      return
    }

    if (currentRoute.name === 'login' || currentRoute.name === 'signup') {
      if (authMode !== 'login') {
        setAuthMode('login')
      }
      navigate('dashboard')
    }
  }, [
    authMode,
    currentRoute.name,
    currentRoute.params,
    isEmailVerified,
    loading,
    navigate,
    redirectIntent,
    setAuthMode,
    setRedirectIntent,
    user,
  ])

  const renderRoute = () => {
    if (!user && isProtectedRoute(currentRoute.name)) {
      if (loading) {
        return <GlobalShellSkeleton />
      }
      return <LoginPage />
    }

    if (user && currentRoute.name === 'login') {
      return <DashboardPage />
    }

    switch (currentRoute.name) {
      case 'login':
        return <LoginPage />
      case 'signup':
        return <SignUpPage />
      case 'dashboard':
        return loading ? <GlobalShellSkeleton /> : <DashboardPage />
      case 'createBlueprint':
        return loading ? <GlobalShellSkeleton /> : <CreateBlueprintPage />
      case 'history':
      case 'blueprintsIndex':
        return loading ? <GlobalShellSkeleton /> : <HistoryPage />
      case 'profile':
        return loading ? <GlobalShellSkeleton /> : <ProfilePage />
      case 'plans':
        return loading ? <GlobalShellSkeleton /> : <PlansPage />
      case 'feedback':
        return loading ? <GlobalShellSkeleton /> : <FeedbackPage />
      case 'billingSuccess':
        return loading ? <GlobalShellSkeleton /> : <BillingSuccessPage />
      case 'billingCancel':
        return loading ? <GlobalShellSkeleton /> : <BillingCancelPage />
      case 'blueprintDetail':
        return loading ? <GlobalShellSkeleton /> : <BlueprintDetailPage />
      case 'verifyEmail':
        return <VerifyEmailPage />
      default:
        return <NotFoundPage />
    }
  }

  const effectiveRouteName: RouteName = useMemo(() => {
    if (!user && isProtectedRoute(currentRoute.name)) {
      return 'login'
    }
    if (user && (currentRoute.name === 'login' || currentRoute.name === 'signup')) {
      return 'dashboard'
    }
    return currentRoute.name
  }, [currentRoute.name, user])

  const showNavigation = Boolean(user) && !['login', 'signup', 'verifyEmail'].includes(effectiveRouteName)
  const contentPaddingClass = showNavigation ? 'pb-24 pt-2 md:pb-0' : ''

  console.log('[App] Current route:', currentRoute.name)
  console.log('[App] User:', user ? user.email : 'Not logged in')
  console.log('[App] Show navigation:', showNavigation)

  return (
    <RouterProvider currentRoute={currentRoute} navigate={navigate}>
      <div className="App min-h-screen bg-background text-foreground">
        {showNavigation && <Navigation />}
        <ServiceWorkerToast />
        <RouteErrorBoundary>
          <Suspense fallback={<SuspenseFallback />}>
            <div className={contentPaddingClass}>{renderRoute()}</div>
          </Suspense>
        </RouteErrorBoundary>
      </div>
    </RouterProvider>
  )
}

const GlobalShellSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  </div>
)
