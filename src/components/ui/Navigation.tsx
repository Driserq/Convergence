import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from '../../contexts/RouterContext'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Avatar, AvatarFallback } from './avatar'

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth()
  const { navigate } = useRouter()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
            >
              Convergence
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/history')}
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              History
            </button>
          </nav>

          {/* User Menu */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-700 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-white" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-gray-400">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/dashboard')}
                  className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/history')}
                  className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                >
                  History
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700 text-red-400"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="block w-full text-left text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/history')}
            className="block w-full text-left text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
          >
            History
          </button>
        </nav>
      </div>
    </header>
  )
}
