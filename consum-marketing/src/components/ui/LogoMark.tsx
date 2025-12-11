import React from "react"

import { cn } from "@/lib/utils"

const LOGO_URL = "/logo.svg"

interface LogoMarkProps {
  className?: string
}

export const LogoMark: React.FC<LogoMarkProps> = ({ className }) => {
  return (
    <span
      aria-hidden
      className={cn("inline-block aspect-square h-6 w-6 text-primary", className)}
      style={{
        backgroundColor: "currentColor",
        maskImage: `url(${LOGO_URL})`,
        WebkitMaskImage: `url(${LOGO_URL})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  )
}
