import React from 'react'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">Checking authentication...</p>
      </div>
    )
  }

  // If user is not authenticated, show fallback or default login prompt
  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }

    // Default fallback - redirect to login
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <div className="text-center">
              <div className="text-yellow-500 text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">
                You need to be logged in to access this page.
              </p>
              <button
                onClick={() => {
                  console.log('[ProtectedRoute] Redirecting to login...')
                  // TODO: Replace with React Router navigation in future phases
                  window.location.href = '/login'
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated, render protected content
  console.log('[ProtectedRoute] User authenticated, rendering protected content for:', user.email)
  return <>{children}</>
}