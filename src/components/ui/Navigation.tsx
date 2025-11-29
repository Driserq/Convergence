import React, { useMemo } from 'react'
import { LayoutDashboard, Menu, PlusCircle, History as HistoryIcon } from 'lucide-react'
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
import { cn } from '../../lib/utils'
import type { RouteName } from '../../routes/map'
import { LogoMark } from './LogoMark'

const bottomNavItems: Array<{
  key: RouteName
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  targets?: RouteName[]
}> = [
  {
    key: 'dashboard',
    label: 'Today',
    icon: LayoutDashboard,
  },
  {
    key: 'createBlueprint',
    label: 'Create',
    icon: PlusCircle,
  },
  {
    key: 'history',
    label: 'History',
    icon: HistoryIcon,
    targets: ['history', 'blueprintsIndex'],
  },
]

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth()
  const { navigate, currentRoute } = useRouter()
  const {
    isLoading: isSubscriptionLoading,
    remaining,
    limit,
  } = useSubscription({ enabled: Boolean(user) })

  const handleLogout = async () => {
    await logout()
    navigate('landing')
  }

  const quotaLabel = useMemo(() => {
    if (!user) return 'View plans'
    if (isSubscriptionLoading) return 'Checking quota…'
    if (limit <= 0) return 'View plans'
    return `${remaining}/${limit} left`
  }, [isSubscriptionLoading, limit, remaining, user])

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  const isActive = (targets: RouteName[]) => targets.includes(currentRoute.name)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('landing')}
            className="flex h-full items-center gap-2 text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
          >
            <LogoMark className="h-full w-auto" />
            <span>Consum</span>
          </button>

          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold md:flex">
            <NavLink label="Today" active={isActive(['dashboard'])} onClick={() => navigate('dashboard')} />
            <NavLink label="Create" active={isActive(['createBlueprint'])} onClick={() => navigate('createBlueprint')} />
            <NavLink label="History" active={isActive(['history', 'blueprintsIndex'])} onClick={() => navigate('history')} />
          </nav>

          <div className="flex items-center gap-2">
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
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-border/70">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 border border-border/60 bg-card text-foreground" align="end">
                <DropdownMenuLabel className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{user?.email ?? 'Account'}</p>
                    <p className="text-xs text-muted-foreground">{quotaLabel}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => navigate('dashboard')} className="cursor-pointer">
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('createBlueprint')} className="cursor-pointer">
                  Create blueprint
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('history')} className="cursor-pointer">
                  History
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => navigate('profile')} className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('plans')} className="cursor-pointer">
                  Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('landing')} className="cursor-pointer">
                  Learn more
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <MobileNavigationBar />
    </>
  )
}

const NavLink: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'transition-colors hover:text-foreground',
      active ? 'text-foreground' : 'text-muted-foreground'
    )}
  >
    {label}
  </button>
)

const MobileNavigationBar: React.FC = () => {
  const { navigate, currentRoute } = useRouter()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
        {bottomNavItems.map(({ key, label, icon: Icon, targets }) => {
          const active = targets
            ? targets.includes(currentRoute.name)
            : currentRoute.name === key

          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-primary')} aria-hidden />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
