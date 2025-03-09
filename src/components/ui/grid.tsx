import * as React from "react"
import { cn } from "@/lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12" | "16"
  responsive?: boolean
}

export function Grid({
  className,
  columns = 1,
  gap = "4",
  responsive = true,
  ...props
}: GridProps): JSX.Element {
  return (
    <div
      className={cn(
        "grid",
        {
          "grid-cols-1": columns === 1,
          "grid-cols-2": columns === 2,
          "grid-cols-3": columns === 3,
          "grid-cols-4": columns === 4,
          "grid-cols-5": columns === 5,
          "grid-cols-6": columns === 6,
          "grid-cols-7": columns === 7,
          "grid-cols-8": columns === 8,
          "grid-cols-9": columns === 9,
          "grid-cols-10": columns === 10,
          "grid-cols-11": columns === 11,
          "grid-cols-12": columns === 12,
          "gap-0": gap === "0",
          "gap-1": gap === "1",
          "gap-2": gap === "2",
          "gap-3": gap === "3",
          "gap-4": gap === "4",
          "gap-5": gap === "5",
          "gap-6": gap === "6",
          "gap-8": gap === "8",
          "gap-10": gap === "10",
          "gap-12": gap === "12",
          "gap-16": gap === "16",
          "md:grid-cols-2 lg:grid-cols-3": responsive && columns >= 3,
          "sm:grid-cols-2": responsive && columns === 2,
        },
        className
      )}
      {...props}
    />
  )
}

export function SimpleGrid({
  className,
  columns = 1,
  gap = "4",
  ...props
}: GridProps): JSX.Element {
  return (
    <Grid
      className={className}
      columns={columns}
      gap={gap}
      responsive={true}
      {...props}
    />
  )
} 