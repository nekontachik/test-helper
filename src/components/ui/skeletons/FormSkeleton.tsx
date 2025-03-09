import { Skeleton } from "@/components/ui/skeleton"

interface FormSkeletonProps {
  fields?: number
  showSubmit?: boolean
}

export function FormSkeleton({
  fields = 4,
  showSubmit = true,
}: FormSkeletonProps): JSX.Element {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      
      {showSubmit && (
        <div className="pt-4">
          <Skeleton className="h-10 w-24" />
        </div>
      )}
    </div>
  )
} 