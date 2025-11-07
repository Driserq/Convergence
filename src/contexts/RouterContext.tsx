import React, { createContext, useContext } from 'react'

interface RouterContextValue {
  navigate: (path: string) => void
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined)

export const RouterProvider: React.FC<{
  navigate: (path: string) => void
  children: React.ReactNode
}> = ({ navigate, children }) => {
  return (
    <RouterContext.Provider value={{ navigate }}>
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
