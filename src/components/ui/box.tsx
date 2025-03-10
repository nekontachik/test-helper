import * as React from "react"
import { cn } from "@/lib/utils"

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Box({
  className,
  as: Component = "div",
  ...props
}: BoxProps): JSX.Element {
  return (
    <Component
      className={cn(className)}
      {...props}
    />
  )
} 