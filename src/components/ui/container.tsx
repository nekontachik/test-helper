import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function Container({
  className,
  size = "xl",
  ...props
}: ContainerProps): JSX.Element {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4",
        {
          "max-w-screen-sm": size === "sm",
          "max-w-screen-md": size === "md",
          "max-w-screen-lg": size === "lg",
          "max-w-screen-xl": size === "xl",
          "max-w-full": size === "full",
        },
        className
      )}
      {...props}
    />
  )
} 