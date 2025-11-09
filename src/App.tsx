import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Navigation } from './components/ui/Navigation'
import { RouterProvider } from './contexts/RouterContext'

// Import all pages
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { History } from './pages/History'
import { BlueprintDetail } from './pages/BlueprintDetail'
import { Profile } from './pages/Profile'
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
  const { user, loading, initialize } = useAuth()
  const [currentPath, setCurrentPath] = useState(() => {
    const win = getBrowserWindow()
    return win?.location.pathname ?? '/'
  })

  const navigate = useCallback((path: string) => {
    setCurrentPath(prev => {
      if (path === prev) {
        return prev
      }

      const win = getBrowserWindow()
      if (win) {
        win.history.pushState({}, '', path)
      }

      return path
    })
  }, [])

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
      setCurrentPath(win.location.pathname)
    }

    win.addEventListener('popstate', handlePopState)
    return () => win.removeEventListener('popstate', handlePopState)
  }, [])

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
      navigate(path)
    }

    doc.addEventListener('click', handleLinkClick)
    return () => doc.removeEventListener('click', handleLinkClick)
  }, [navigate])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">Loading application...</p>
      </div>
    )
  }

  // Route matching and rendering
  const renderPage = () => {
    // Handle blueprint detail routes with ID parameter
    const blueprintDetailMatch = currentPath.match(/^\/blueprints\/([^\/]+)$/)
    if (blueprintDetailMatch) {
      // Protected route
      if (!user) {
        navigate('/login')
        return <Login />
      }
      return <BlueprintDetail />
    }

    switch (currentPath) {
      case '/':
        // Always show Landing page at root
        return <Landing />
      
      case '/login':
        // If already logged in, redirect to dashboard
        if (user) {
          navigate('/dashboard')
          return <Dashboard />
        }
        return <Login />
      
      case '/dashboard':
        // Protected: require login
        if (!user) {
          navigate('/login')
          return <Login />
        }
        return <Dashboard />
      
      case '/history':
      case '/blueprints':
        // Protected: require login
        if (!user) {
          navigate('/login')
          return <Login />
        }
        return <History />
      
      case '/profile':
        // Protected: require login
        if (!user) {
          navigate('/login')
          return <Login />
        }
        return <Profile />
      
      default:
        return <NotFound />
    }
  }

  // Check if current page needs navigation (authenticated pages)
  // Show navigation on all authenticated pages (not Landing or Login)
  const showNavigation = user && !['/login', '/'].includes(currentPath)

  // Debug logging
  console.log('[App] Current path:', currentPath)
  console.log('[App] User:', user ? user.email : 'Not logged in')
  console.log('[App] Show navigation:', showNavigation)

  return (
    <RouterProvider navigate={navigate}>
      <div className="App">
        {showNavigation && <Navigation />}
        {renderPage()}
      </div>
    </RouterProvider>
  )
}
