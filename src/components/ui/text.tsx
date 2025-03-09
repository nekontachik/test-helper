import * as React from "react"
import { cn } from "@/lib/utils"

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span" | "div"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  weight?: "normal" | "medium" | "semibold" | "bold"
  color?: "default" | "muted" | "primary" | "success" | "warning" | "danger"
}

export function Text({
  className,
  as: Component = "p",
  size = "md",
  weight = "normal",
  color = "default",
  ...props
}: TextProps): JSX.Element {
  return (
    <Component
      className={cn(
        {
          "text-xs": size === "xs",
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
          "text-xl": size === "xl",
          "font-normal": weight === "normal",
          "font-medium": weight === "medium",
          "font-semibold": weight === "semibold",
          "font-bold": weight === "bold",
          "text-foreground": color === "default",
          "text-muted-foreground": color === "muted",
          "text-primary": color === "primary",
          "text-green-600 dark:text-green-500": color === "success",
          "text-amber-600 dark:text-amber-500": color === "warning",
          "text-red-600 dark:text-red-500": color === "danger",
        },
        className
      )}
      {...props}
    />
  )
} 