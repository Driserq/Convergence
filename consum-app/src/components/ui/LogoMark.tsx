import React from 'react'

import logoUrl from '../../../logo.svg'
import { cn } from '../../lib/utils'

interface LogoMarkProps {
  className?: string
}

export const LogoMark: React.FC<LogoMarkProps> = ({ className }) => {
  return (
    <span
      aria-hidden
      className={cn('inline-block aspect-square h-6 w-6 text-primary', className)}
      style={{
        backgroundColor: 'currentColor',
        maskImage: `url(${logoUrl})`,
        WebkitMaskImage: `url(${logoUrl})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  )
}
