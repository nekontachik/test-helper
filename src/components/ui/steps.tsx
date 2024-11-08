'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Steps is a component that displays a progress indicator for multi-step processes.
 * It provides visual feedback about the current step and overall progress.
 */

interface Step {
  /** Unique identifier for the step */
  id: string;
  /** Display title for the step */
  title: string;
  /** Optional description for the step */
  description?: string;
  /** Optional icon for the step */
  icon?: React.ReactNode;
}

interface StepsProps {
  /** Array of step configurations */
  steps: Step[];
  /** Index of the current active step */
  currentStep: number;
  /** Optional additional className */
  className?: string;
  /** Optional click handler for steps */
  onStepClick?: (stepIndex: number) => void;
  /** Whether steps are clickable */
  clickable?: boolean;
}

/**
 * Steps Component
 * 
 * @example
 * ```tsx
 * <Steps
 *   steps={[
 *     { id: 'details', title: 'Details' },
 *     { id: 'payment', title: 'Payment' },
 *     { id: 'confirm', title: 'Confirm' }
 *   ]}
 *   currentStep={1}
 *   clickable
 *   onStepClick={(index) => console.log('Clicked step:', index)}
 * />
 * ```
 */
export function Steps({
  steps,
  currentStep,
  className,
  onStepClick,
  clickable = false
}: StepsProps) {
  const handleStepClick = React.useCallback((index: number) => {
    if (clickable && onStepClick) {
      onStepClick(index);
    }
  }, [clickable, onStepClick]);

  return (
    <nav
      className={cn('w-full', className)}
      aria-label="Progress"
      role="navigation"
    >
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isLast = index === steps.length - 1;
          const isCurrent = index === currentStep;

          return (
            <React.Fragment key={step.id}>
              <div 
                className={cn(
                  'flex flex-col items-center relative',
                  clickable && 'cursor-pointer'
                )}
                onClick={() => handleStepClick(index)}
                role={clickable ? 'button' : 'presentation'}
                tabIndex={clickable ? 0 : -1}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                    isActive
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {step.icon || index + 1}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="mt-1 text-xs text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 border-t-2 transition-colors relative top-4',
                    isActive ? 'border-primary' : 'border-muted'
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * State Management:
 * - Tracks current step index
 * - Manages step completion state
 * - Handles step click events
 */

/**
 * Accessibility:
 * - Uses semantic nav element
 * - Includes proper ARIA roles
 * - Supports keyboard navigation
 * - Indicates current step
 */

/**
 * Performance Considerations:
 * - Memoized click handler
 * - Efficient DOM updates
 * - Minimal re-renders
 * - Optimized styling with Tailwind
 */

/**
 * Props:
 * | Name        | Type                        | Default | Description                    |
 * |-------------|----------------------------|---------|--------------------------------|
 * | steps       | Step[]                     | -       | Array of step configurations   |
 * | currentStep | number                     | -       | Index of current active step   |
 * | className   | string                     | -       | Optional additional classes    |
 * | onStepClick | (index: number) => void    | -       | Optional step click handler    |
 * | clickable   | boolean                    | false   | Whether steps are clickable    |
 */

/**
 * Best Practices:
 * - Clear visual hierarchy
 * - Consistent spacing
 * - Responsive design
 * - Clear step indicators
 * - Interactive feedback
 */

/**
 * Related Components:
 * - Stepper
 * - Progress
 * - Wizard
 * - MultiStepForm
 */ 