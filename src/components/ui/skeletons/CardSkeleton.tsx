'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CardSkeletonProps {
  hasHeader?: boolean;
  hasFooter?: boolean;
  headerHeight?: number;
  contentCount?: number;
  contentHeight?: number;
  footerHeight?: number;
  className?: string;
}

/**
 * A skeleton loader for card components
 */
export function CardSkeleton({
  hasHeader = true,
  hasFooter = false,
  headerHeight = 20,
  contentCount = 3,
  contentHeight = 16,
  footerHeight = 40,
  className
}: CardSkeletonProps): JSX.Element {
  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader>
          <Skeleton className="w-2/3" style={{ height: `${headerHeight}px` }} />
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {Array.from({ length: contentCount }).map((_, i) => (
          <Skeleton key={i} className="w-full" style={{ height: `${contentHeight}px` }} />
        ))}
      </CardContent>
      {hasFooter && (
        <CardFooter>
          <Skeleton className="w-1/3" style={{ height: `${footerHeight}px` }} />
        </CardFooter>
      )}
    </Card>
  );
} 