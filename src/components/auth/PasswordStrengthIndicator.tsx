'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrength } from '@/lib/auth/passwordValidation';

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
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStrength = async () => {
      if (password.length === 0) {
        setStrength(null);
        onStrengthChange?.(false);
        return;
      }

      setLoading(true);
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
        setLoading(false);
      }
    };

    const debounce = setTimeout(checkStrength, 300);
    return () => clearTimeout(debounce);
  }, [password, email, onStrengthChange]);

  if (!strength || !password) return null;

  const strengthColor = {
    0: 'bg-red-500',
    1: 'bg-orange-500',
    2: 'bg-yellow-500',
    3: 'bg-green-500',
    4: 'bg-green-600',
  }[strength.score];

  return (
    <div className="space-y-2">
      <Progress
        value={(strength.score / 4) * 100}
        className={`h-1 ${strengthColor}`}
      />
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