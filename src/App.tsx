import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Navigation } from './components/ui/Navigation'
import { RouterProvider } from './contexts/RouterContext'
import {
  isProtectedRoute,
  resolveRoute,
  routeDictionary,
  type RouteArgs,
  type NavigateFn,
  type RouteMatch,
} from './routes/map'

// Import all pages
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { History } from './pages/History'
import { BlueprintDetail } from './pages/BlueprintDetail'
import { Profile } from './pages/Profile'
import { Plans } from './pages/Plans'
import { NotFound } from './pages/NotFound'

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

    if (redirectIntent) {
      navigate(redirectIntent.name, redirectIntent.params as any)
      setRedirectIntent(null)
      if (authMode !== 'login') {
        setAuthMode('login')
      }
      return
    }

    if (currentRoute.name === 'login') {
      if (authMode !== 'login') {
        setAuthMode('login')
      }
      navigate('dashboard')
    }
  }, [
    authMode,
    currentRoute.name,
    currentRoute.params,
    loading,
    navigate,
    redirectIntent,
    setAuthMode,
    setRedirectIntent,
    user,
  ])

  const renderRoute = () => {
    if (!user && isProtectedRoute(currentRoute.name)) {
      return <Login />
    }

    if (user && currentRoute.name === 'login') {
      return <Dashboard />
    }

    switch (currentRoute.name) {
      case 'landing':
        return <Landing />
      case 'login':
        return <Login />
      case 'dashboard':
        return <Dashboard />
      case 'history':
      case 'blueprintsIndex':
        return <History />
      case 'profile':
        return <Profile />
      case 'plans':
        return <Plans />
      case 'blueprintDetail':
        return <BlueprintDetail />
      default:
        return <NotFound />
    }
  }

  const effectiveRouteName: RouteName = useMemo(() => {
    if (!user && isProtectedRoute(currentRoute.name)) {
      return 'login'
    }
    if (user && currentRoute.name === 'login') {
      return 'dashboard'
    }
    return currentRoute.name
  }, [currentRoute.name, user])

  const showNavigation = Boolean(user) && !['landing', 'login'].includes(effectiveRouteName)

  console.log('[App] Current route:', currentRoute.name)
  console.log('[App] User:', user ? user.email : 'Not logged in')
  console.log('[App] Show navigation:', showNavigation)

  return (
    <RouterProvider currentRoute={currentRoute} navigate={navigate}>
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Loading application...</p>
        </div>
      ) : (
        <div className="App min-h-screen bg-background text-foreground">
          {showNavigation && <Navigation />}
          {renderRoute()}
        </div>
      )}
    </RouterProvider>
  )
}
