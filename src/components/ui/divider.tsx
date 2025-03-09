import * as React from "react"
import { cn } from "@/lib/utils"

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical"
}

export function Divider({
  className,
  orientation = "horizontal",
  ...props
}: DividerProps): JSX.Element {
  return (
    <hr
      className={cn(
        "border-border",
        orientation === "horizontal" ? "w-full border-t" : "h-full border-l",
        className
      )}
      {...props}
    />
  )
} 