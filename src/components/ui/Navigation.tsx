import React, { useMemo } from 'react'
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
import { useSubscription } from '../../hooks/useSubscription'

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth()
  const { navigate } = useRouter()
  const {
    isLoading: isSubscriptionLoading,
    remaining,
    limit
  } = useSubscription({ enabled: Boolean(user) })
  const headerClasses = 'sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'

  const containerClasses = 'relative z-10 mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8'

  const mobileNavClasses = 'relative z-10 flex w-full items-center justify-center gap-4 px-4 pb-4 text-sm font-semibold md:hidden'

  const handleLogout = async () => {
    await logout()
    navigate('landing')
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  const quotaLabel = useMemo(() => {
    if (!user) return 'View plans'
    if (isSubscriptionLoading) return 'Checking quota…'
    if (limit <= 0) return 'View plans'
    return `${remaining}/${limit} left`
  }, [isSubscriptionLoading, limit, remaining, user])

  return (
    <header className={headerClasses}>
      <div className={containerClasses}>
        <button
          onClick={() => navigate('landing')}
          className="text-xl font-bold text-foreground transition-colors hover:text-primary"
        >
          Convergence
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold md:flex">
          <button
            onClick={() => navigate('dashboard')}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('history')}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            History
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <Button
              variant="outline"
              size="sm"
              className="hidden rounded-full border-primary/40 text-primary hover:bg-primary/10 md:inline-flex"
              onClick={() => navigate('plans')}
            >
              {quotaLabel}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border border-border/60 bg-card text-foreground" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => navigate('profile')}
                className="cursor-pointer text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus:bg-muted/40 focus:text-foreground"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('plans')}
                className="cursor-pointer text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus:bg-muted/40 focus:text-foreground"
              >
                Plans
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('dashboard')}
                className="cursor-pointer text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus:bg-muted/40 focus:text-foreground"
              >
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive transition-colors hover:bg-muted/40 focus:bg-muted/40"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav className={mobileNavClasses}>
        <button
          onClick={() => navigate('dashboard')}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('history')}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          History
        </button>
      </nav>
    </header>
  )
}
