'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface FormSkeletonProps {
  fields?: number;
  hasHeader?: boolean;
  hasFooter?: boolean;
  className?: string;
}

/**
 * A skeleton loader for form components
 */
export function FormSkeleton({
  fields = 4,
  hasHeader = true,
  hasFooter = true,
  className
}: FormSkeletonProps): JSX.Element {
  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
      
      {hasFooter && (
        <CardFooter className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      )}
    </Card>
  );
} 