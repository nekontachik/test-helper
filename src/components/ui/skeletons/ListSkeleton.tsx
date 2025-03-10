'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
  items?: number;
  itemHeight?: number;
  gap?: number;
  className?: string;
}

/**
 * A skeleton loader for list components
 */
export function ListSkeleton({
  items = 5,
  itemHeight = 16,
  gap = 4,
  className
}: ListSkeletonProps): JSX.Element {
  return (
    <div className={`space-y-${gap} w-full ${className || ''}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className={`h-${itemHeight} w-full rounded-md`} />
        </div>
      ))}
    </div>
  );
} 