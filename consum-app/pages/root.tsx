import '../src/styles/globals.css'
import { Outlet, useLocation } from 'react-router'
import { useAuth } from '../src/hooks/useAuth'
import { Navigation } from '../src/components/ui/Navigation'
import { useEffect } from 'react'
import { useHead } from '@unhead/react'

export default function Layout() {
  const { user, loading, initialize } = useAuth()
  const location = useLocation()

  useHead({
    title: 'Consum - Habit Blueprint MVP',
    meta: [
      {
        name: 'description',
        content:
          'Consum turns your self-improvement content into personalized habit blueprints with actionable steps.',
      },
    ],
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const publicRoutes = ['/', '/login']
  const isPublic = publicRoutes.includes(location.pathname)

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

  const showNavigation = !!user && !isPublic

  return (
    <div className="App min-h-screen bg-background text-foreground">
      {showNavigation && <Navigation />}
      <Outlet />
    </div>
  )
}
