import * as React from "react"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    decorative?: boolean
    orientation?: "horizontal" | "vertical"
  }
>(({ className, decorative = true, orientation = "horizontal", role = "none", ...props }, ref) => (
  <div
    ref={ref}
    role={decorative ? "none" : role}
    data-orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
))
Separator.displayName = "Separator"

export { Separator }
