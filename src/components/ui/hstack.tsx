import * as React from "react"
import { cn } from "@/lib/utils"

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12" | "16";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

export function HStack({
  className,
  spacing = "4",
  align = "center",
  justify = "start",
  ...props
}: HStackProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-row",
        {
          "gap-0": spacing === "0",
          "gap-1": spacing === "1",
          "gap-2": spacing === "2",
          "gap-3": spacing === "3",
          "gap-4": spacing === "4",
          "gap-5": spacing === "5",
          "gap-6": spacing === "6",
          "gap-8": spacing === "8",
          "gap-10": spacing === "10",
          "gap-12": spacing === "12",
          "gap-16": spacing === "16",
          "items-start": align === "start",
          "items-center": align === "center",
          "items-end": align === "end",
          "items-stretch": align === "stretch",
          "items-baseline": align === "baseline",
          "justify-start": justify === "start",
          "justify-center": justify === "center",
          "justify-end": justify === "end",
          "justify-between": justify === "between",
          "justify-around": justify === "around",
          "justify-evenly": justify === "evenly",
        },
        className
      )}
      {...props}
    />
  )
} 