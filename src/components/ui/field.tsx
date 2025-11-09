import * as React from "react"

import { cn } from "../../lib/utils"

type FieldProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal"
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <div
      ref={ref}
      data-orientation={orientation}
      className={cn(
        "gap-3",
        orientation === "horizontal" ? "flex items-center" : "flex flex-col",
        className
      )}
      {...props}
    />
  )
)
Field.displayName = "Field"

const FieldGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />
  )
)
FieldGroup.displayName = "FieldGroup"

const FieldContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col", className)} {...props} />
  )
)
FieldContent.displayName = "FieldContent"

const FieldLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none text-foreground", className)}
      {...props}
    />
  )
)
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
FieldDescription.displayName = "FieldDescription"

type FieldLegendProps = React.HTMLAttributes<HTMLLegendElement> & {
  variant?: "default" | "label"
}

const FieldLegend = React.forwardRef<HTMLLegendElement, FieldLegendProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <legend
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none text-foreground",
        variant === "label" && "text-sm font-medium uppercase tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
FieldLegend.displayName = "FieldLegend"

const FieldSet = React.forwardRef<HTMLFieldSetElement, React.HTMLAttributes<HTMLFieldSetElement>>(
  ({ className, ...props }, ref) => (
    <fieldset ref={ref} className={cn("space-y-4", className)} {...props} />
  )
)
FieldSet.displayName = "FieldSet"

const FieldSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("h-px w-full bg-border", className)} {...props} />
  )
)
FieldSeparator.displayName = "FieldSeparator"

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
}
