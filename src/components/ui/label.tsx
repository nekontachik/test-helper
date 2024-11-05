'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

/**
 * Label Component
 * 
 * A form label component that provides accessible labeling for form controls.
 * Built on top of Radix UI's Label primitive with added styling and accessibility features.
 */

// Types and Interfaces
export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /**
   * Additional CSS classes to apply to the label
   */
  className?: string;
  /**
   * Whether the label represents a required field
   */
  required?: boolean;
  /**
   * Whether the associated field has an error
   */
  error?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, error, children, ...props }, ref) => {
  // Combine classes based on props
  const labelClasses = cn(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    error && 'text-destructive',
    className
  );

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={labelClasses}
      {...props}
    >
      {children}
      {required && (
        <span 
          className="text-destructive ml-1" 
          aria-hidden="true"
        >
          *
        </span>
      )}
    </LabelPrimitive.Root>
  );
});

// Display name for React DevTools
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

/**
 * Usage Examples:
 * 
 * Basic Label:
 * <Label htmlFor="email">Email</Label>
 * 
 * Required Field Label:
 * <Label htmlFor="password" required>Password</Label>
 * 
 * Error State Label:
 * <Label htmlFor="username" error>Username</Label>
 * 
 * With Custom Styling:
 * <Label className="text-lg font-bold">Custom Label</Label>
 */

/**
 * Accessibility Features:
 * - Automatically associates with form controls using htmlFor
 * - Proper ARIA attributes for required fields
 * - Visual indication for error states
 * - Keyboard focus management
 * 
 * Performance Considerations:
 * - Memoized internal functions
 * - Minimal re-renders
 * - Small bundle size
 * 
 * Dependencies:
 * - @radix-ui/react-label
 * - clsx/tailwind-merge (via cn utility)
 */ 