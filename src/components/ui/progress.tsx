'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

/**
 * Progress is a component that shows the completion status of a task or process.
 * Built on top of Radix UI's Progress primitive for accessibility and customization.
 */

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** The current progress value (0-100) */
  value?: number;
  /** Optional maximum value */
  max?: number;
  /** Optional minimum value */
  min?: number;
  /** Optional indicator color class */
  indicatorColor?: string;
  /** Optional background color class */
  backgroundColor?: string;
  /** Optional label for accessibility */
  label?: string;
  /** Optional description for accessibility */
  description?: string;
}

/**
 * Progress Component
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Progress value={75} />
 * 
 * // With custom colors
 * <Progress 
 *   value={75} 
 *   indicatorColor="bg-blue-500"
 *   backgroundColor="bg-blue-100"
 * />
 * 
 * // With accessibility labels
 * <Progress
 *   value={75}
 *   label="Upload progress"
 *   description="Uploading files..."
 * />
 * ```
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({
  className,
  value = 0,
  min = 0,
  max = 100,
  indicatorColor,
  backgroundColor,
  label,
  description,
  ...props
}, ref) => {
  // Normalize value between min and max
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  return (
    <div className="w-full" role="presentation">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full',
          backgroundColor || 'bg-secondary',
          className
        )}
        {...props}
        value={percentage}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={normalizedValue}
        aria-valuetext={`${Math.round(percentage)}%`}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 transition-transform duration-300 ease-in-out',
            indicatorColor || 'bg-primary'
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground" id={`${props.id}-description`}>
          {description}
        </p>
      )}
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress };

/**
 * State Management:
 * - Tracks progress value
 * - Normalizes value between min and max
 * - Calculates percentage completion
 */

/**
 * Accessibility:
 * - Uses semantic progress element
 * - Includes ARIA attributes for value and range
 * - Provides text labels and descriptions
 * - Maintains proper roles
 */

/**
 * Performance Considerations:
 * - Optimized value normalization
 * - Hardware-accelerated transitions
 * - Minimal re-renders
 * - Efficient DOM updates
 */

/**
 * Props:
 * | Name            | Type    | Default | Description                          |
 * |-----------------|---------|---------|--------------------------------------|
 * | value           | number  | 0       | Current progress value               |
 * | min             | number  | 0       | Minimum value                        |
 * | max             | number  | 100     | Maximum value                        |
 * | indicatorColor  | string  | -       | Custom indicator color class         |
 * | backgroundColor | string  | -       | Custom background color class        |
 * | label           | string  | -       | Accessible label                     |
 * | description     | string  | -       | Additional description               |
 * | className       | string  | -       | Additional classes                   |
 */

/**
 * Best Practices:
 * - Always provide a label for accessibility
 * - Use appropriate min/max values
 * - Provide clear visual feedback
 * - Maintain smooth transitions
 * - Use semantic color classes
 */

/**
 * Related Components:
 * - Spinner
 * - LoadingBar
 * - CircularProgress
 * - ProgressIndicator
 * - LoadingSpinner
 */ 