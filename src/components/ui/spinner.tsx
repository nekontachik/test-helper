'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Spinner({ className, ...props }: SpinnerProps): React.ReactElement {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
      {...props}
    />
  );
} 