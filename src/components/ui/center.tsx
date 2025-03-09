import * as React from "react"
import { cn } from "@/lib/utils"

interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  inline?: boolean
}

export function Center({
  className,
  inline = false,
  ...props
}: CenterProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        inline ? "inline-flex" : "flex",
        className
      )}
      {...props}
    />
  )
} 