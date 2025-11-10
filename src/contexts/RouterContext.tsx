import React, { createContext, useContext } from 'react'

import type { NavigateFn, RouteMatch, RouteName, RouteParams } from '../routes/map'

interface RouterContextValue {
  currentRoute: RouteMatch
  navigate: NavigateFn
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined)

export const RouterProvider: React.FC<{
  currentRoute: RouteMatch
  navigate: NavigateFn
  children: React.ReactNode
}> = ({ currentRoute, navigate, children }) => {
  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export const useRouter = () => {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider')
  }
  return context
}

export const useRouteMatch = () => {
  const { currentRoute } = useRouter()
  return currentRoute
}

export const useRouteParams = <Name extends RouteName>(): RouteParams<Name> => {
  const { currentRoute } = useRouter()
  return currentRoute.params as RouteParams<Name>
}
