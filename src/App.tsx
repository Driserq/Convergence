import React, { useEffect, useState } from 'react'
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

export const App: React.FC = () => {
  const { user, loading, initialize } = useAuth()
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  )

  // Initialize auth globally - this ensures we only have one auth listener
  useEffect(() => {
    console.log('[App] Initializing auth globally...')
    initialize()
  }, [initialize])

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Intercept link clicks for client-side navigation
  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      
      // Only handle <a> tags with href that are internal links
      if (
        target.tagName === 'A' && 
        target.href && 
        target.href.startsWith(window.location.origin) &&
        !target.hasAttribute('target') // Don't intercept target="_blank" links
      ) {
        e.preventDefault()
        const path = new URL(target.href).pathname
        navigate(path)
      }
    }

    document.addEventListener('click', handleLinkClick)
    return () => document.removeEventListener('click', handleLinkClick)
  }, [])

  // Navigate function for programmatic navigation
  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path)
      setCurrentPath(path)
    }
  }

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
