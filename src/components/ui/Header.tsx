import React from 'react'
import { useAuth } from '../../hooks/useAuth'

export const Header: React.FC = () => {
  const { user, logout, loading } = useAuth()

  const handleLogout = async () => {
    console.log('[Header] User requesting logout...')
    try {
      await logout()
      console.log('[Header] Logout completed')
      // TODO: Replace with React Router navigation in future phases
      window.location.href = '/login'
    } catch (error) {
      console.error('[Header] Error during logout:', error)
    }
  }

  // Don't show header if no user is logged in
  if (!user) {
    return null
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Convergence
            </h1>
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              MVP
            </span>
          </div>

          {/* Navigation - will be expanded in future phases */}
          <nav className="hidden md:flex space-x-8">
            {/* Navigation items will be added in future phases */}
            <span className="text-gray-500 text-sm">
              Navigation coming in Phase 3
            </span>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="hidden sm:flex sm:items-center sm:space-x-2">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user.email}</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging out...
                </>
              ) : (
                'Logout'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile user info */}
      <div className="sm:hidden px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-700">
          Logged in as: <span className="font-medium">{user.email}</span>
        </div>
      </div>
    </header>
  )
}