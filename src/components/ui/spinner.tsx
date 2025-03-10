'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "muted" | "accent" | "white";
  thickness?: "thin" | "medium" | "thick";
}

export function Spinner({
  className,
  size = "md",
  color = "primary",
  thickness = "medium",
  ...props
}: SpinnerProps): JSX.Element {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        {
          "h-3 w-3": size === "xs",
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "md",
          "h-8 w-8": size === "lg",
          "h-12 w-12": size === "xl",
          "border-[1px] border-t-[1px]": thickness === "thin",
          "border-2 border-t-2": thickness === "medium",
          "border-4 border-t-4": thickness === "thick",
          "text-primary": color === "primary",
          "text-secondary": color === "secondary",
          "text-muted": color === "muted",
          "text-accent": color === "accent",
          "text-white": color === "white",
        },
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
} 