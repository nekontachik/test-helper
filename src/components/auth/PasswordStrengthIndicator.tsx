'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PasswordStrength } from '@/lib/auth/passwordValidation';

interface PasswordStrengthIndicatorProps {
  /** Password to check strength for */
  password: string;
  /** Optional email for additional validation */
  email?: string;
  /** Optional callback for strength changes */
  onStrengthChange?: (isStrong: boolean) => void;
}

export function PasswordStrengthIndicator({
  password,
  email,
  onStrengthChange,
}: PasswordStrengthIndicatorProps): JSX.Element | null {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStrength = async (): Promise<void> => {
      if (password.length === 0) {
        setStrength(null);
        onStrengthChange?.(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/password/strength', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, email }),
        });

        if (!response.ok) throw new Error('Failed to check password strength');

        const data = await response.json();
        setStrength(data);
        onStrengthChange?.(data.isStrong);
      } catch (error) {
        console.error('Password strength check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(checkStrength, 300);
    return () => clearTimeout(debounce);
  }, [password, email, onStrengthChange]);

  if (!strength || !password) return null;

  const strengthColor = {
    0: 'primary-red',
    1: 'primary-orange',
    2: 'primary-yellow',
    3: 'primary-green',
    4: 'primary-green',
  }[strength.score];

  return (
    <div className="space-y-2">
      {isLoading ? (
        <div className="animate-pulse bg-gray-200 h-4 w-full rounded" />
      ) : (
        <Progress
          value={(strength.score / 4) * 100}
          indicatorColor={`bg-${strengthColor}`}
          backgroundColor="bg-secondary"
        />
      )}
      {strength.feedback.warning && (
        <Alert 
          variant="default" 
          className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
        >
          <AlertDescription>{strength.feedback.warning}</AlertDescription>
        </Alert>
      )}
      {strength.feedback.suggestions.length > 0 && (
        <ul className="text-sm text-muted-foreground list-disc list-inside">
          {strength.feedback.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
} 