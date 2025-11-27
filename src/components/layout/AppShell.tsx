import React from 'react'
import { cn } from '../../lib/utils'

interface AppShellProps {
  children: React.ReactNode
  className?: string
  padded?: boolean
}

export const AppShell: React.FC<AppShellProps> = ({ children, className, padded = true }) => {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-5xl flex-col gap-6',
        padded && 'px-4 py-6 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  )
}
