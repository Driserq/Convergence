import React, { useMemo, useState } from 'react'
import { LayoutDashboard, Menu, PlusCircle, History as HistoryIcon, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
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
import { Separator } from './separator'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('landing')
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const handleRoute = (route: RouteName) => {
    navigate(route)
    closeMobileMenu()
  }
  const handleMobileLogout = async () => {
    await handleLogout()
    closeMobileMenu()
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

  const mainNavigationItems: Array<{ label: string; route: RouteName }> = useMemo(
    () => [
      { label: 'Today', route: 'dashboard' },
      { label: 'Create blueprint', route: 'createBlueprint' },
      { label: 'History', route: 'history' },
    ],
    []
  )

  const secondaryNavigationItems: Array<{ label: string; route: RouteName }> = useMemo(
    () => [
      { label: 'Profile', route: 'profile' },
      { label: 'Plans', route: 'plans' },
      { label: 'Learn more', route: 'landing' },
    ],
    []
  )

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
                <Button variant="outline" size="icon" className="hidden h-10 w-10 rounded-full border-border/70 md:inline-flex">
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
                {mainNavigationItems.map(item => (
                  <DropdownMenuItem
                    key={item.route}
                    onClick={() => navigate(item.route)}
                    className="cursor-pointer"
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-border" />
                {secondaryNavigationItems.map(item => (
                  <DropdownMenuItem
                    key={item.route}
                    onClick={() => navigate(item.route)}
                    className="cursor-pointer"
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-border/70 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </div>
        </div>
      </header>
      <MobileMenuDrawer
        open={isMobileMenuOpen}
        onClose={closeMobileMenu}
        mainItems={mainNavigationItems}
        secondaryItems={secondaryNavigationItems}
        onRoute={handleRoute}
        onLogout={handleMobileLogout}
        quotaLabel={quotaLabel}
        email={user?.email ?? 'Account'}
      />
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

interface MobileMenuDrawerProps {
  open: boolean
  onClose: () => void
  onRoute: (route: RouteName) => void
  onLogout: () => void | Promise<void>
  mainItems: Array<{ label: string; route: RouteName }>
  secondaryItems: Array<{ label: string; route: RouteName }>
  quotaLabel: string
  email: string
}

const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  open,
  onClose,
  onRoute,
  onLogout,
  mainItems,
  secondaryItems,
  quotaLabel,
  email,
}) => (
  <DialogPrimitive.Root open={open} onOpenChange={(val) => { if (!val) onClose() }}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 md:hidden" />
      <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm translate-x-0 border-l border-border/60 bg-background p-6 shadow-2xl transition-transform duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="text-base font-semibold text-foreground">{email}</p>
            <p className="text-xs text-muted-foreground">{quotaLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {mainItems.map(item => (
              <button
                key={item.route}
                type="button"
                onClick={() => onRoute(item.route)}
                className="w-full rounded-2xl border border-border/60 px-4 py-3 text-left text-base font-semibold text-foreground transition-colors hover:bg-primary/10"
              >
                {item.label}
              </button>
            ))}
          </div>
          <Separator className="border-border/60" />
          <div className="flex flex-col gap-2">
            {secondaryItems.map(item => (
              <button
                key={item.route}
                type="button"
                onClick={() => onRoute(item.route)}
                className="w-full rounded-2xl border border-border/60 px-4 py-3 text-left text-base font-medium text-foreground transition-colors hover:bg-primary/10"
              >
                {item.label}
              </button>
            ))}
          </div>
          <Separator className="border-border/60" />
          <Button
            variant="destructive"
            className="w-full rounded-2xl py-3"
            onClick={onLogout}
          >
            Log out
          </Button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
)
