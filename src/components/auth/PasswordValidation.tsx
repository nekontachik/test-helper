'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X } from 'lucide-react';
import { PasswordStrengthResult } from '@/lib/auth/passwordPolicy';

/**
 * PasswordValidation is a component that provides real-time password validation feedback.
 * It displays password strength, validation rules, and suggestions for improvement.
 */

interface PasswordValidationProps {
  /** Password to validate */
  password: string;
  /** Optional context for validation */
  context?: {
    /** User's email for comparison */
    email?: string;
    /** User's name for comparison */
    name?: string;
  };
  /** Callback for validation state changes */
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * PasswordValidation Component
 * 
 * @example
 * ```tsx
 * <PasswordValidation
 *   password={password}
 *   context={{ email: "user@example.com" }}
 *   onValidationChange={(isValid) => setIsPasswordValid(isValid)}
 * />
 * ```
 */
export function PasswordValidation({
  password,
  context,
  onValidationChange,
}: PasswordValidationProps) {
  const [validation, setValidation] = React.useState<PasswordStrengthResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const validatePassword = React.useCallback(async () => {
    if (!password) {
      setValidation(null);
      onValidationChange?.(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/password/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, context }),
      });

      if (!response.ok) throw new Error('Validation failed');

      const result = await response.json();
      setValidation(result);
      onValidationChange?.(result.isStrong);
    } catch (error) {
      console.error('Password validation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [password, context, onValidationChange]);

  React.useEffect(() => {
    const debounce = setTimeout(validatePassword, 300);
    return () => clearTimeout(debounce);
  }, [validatePassword]);

  if (!password || !validation) return null;

  const strengthColor = validation?.score !== undefined ? {
    0: 'primary-red',
    1: 'primary-orange',
    2: 'primary-yellow',
    3: 'primary-green',
    4: 'primary-green',
  }[validation.score] : 'primary';

  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="space-y-2">
        {isLoading ? (
          <div className="animate-pulse bg-gray-200 h-4 w-full rounded" />
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span>Password Strength</span>
              <span className={validation.isStrong ? 'text-green-500' : 'text-red-500'}>
                {validation.isStrong ? 'Strong' : 'Weak'}
              </span>
            </div>
            <Progress
              value={(validation.score / 4) * 100}
              indicatorColor={`bg-${strengthColor}`}
              backgroundColor="bg-secondary"
              aria-label="Password strength indicator"
            />
          </>
        )}
      </div>

      {validation.feedback.warning && (
        <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
          <AlertDescription>{validation.feedback.warning}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {validation.feedback.suggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 text-sm"
            role="listitem"
          >
            {validation.failedPolicies.includes(suggestion) ? (
              <X className="h-4 w-4 text-red-500" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
            )}
            <span>{suggestion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * State Management:
 * - Tracks password validation state
 * - Manages loading state
 * - Handles validation updates
 */

/**
 * Accessibility:
 * - Uses semantic HTML structure
 * - Includes ARIA live regions
 * - Provides clear feedback
 * - Maintains proper roles
 */

/**
 * Error Handling:
 * - Handles API errors gracefully
 * - Provides validation feedback
 * - Logs errors for debugging
 */

/**
 * Performance Considerations:
 * - Debounced validation
 * - Memoized callback
 * - Efficient re-renders
 * - Optimized API calls
 */

/**
 * Props:
 * | Name              | Type                    | Default | Description                          |
 * |-------------------|-------------------------|---------|--------------------------------------|
 * | password          | string                 | -       | Password to validate                 |
 * | context           | object                 | -       | Additional validation context        |
 * | onValidationChange| (isValid: boolean) => void | -   | Validation state change callback    |
 */

/**
 * Best Practices:
 * - Clear visual feedback
 * - Real-time validation
 * - Comprehensive rules
 * - Secure validation
 */

/**
 * Related Components:
 * - PasswordInput
 * - PasswordStrengthIndicator
 * - ValidationRules
 */