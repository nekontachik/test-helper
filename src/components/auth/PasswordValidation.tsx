'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { PasswordStrengthResult } from '@/lib/auth/passwordPolicy';

interface PasswordValidationProps {
  password: string;
  context?: {
    email?: string;
    name?: string;
  };
  onValidationChange?: (isValid: boolean) => void;
}

export function PasswordValidation({
  password,
  context,
  onValidationChange,
}: PasswordValidationProps) {
  const [validation, setValidation] = useState<PasswordStrengthResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const validatePassword = async () => {
      if (!password) {
        setValidation(null);
        onValidationChange?.(false);
        return;
      }

      setLoading(true);
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
        setLoading(false);
      }
    };

    const debounce = setTimeout(validatePassword, 300);
    return () => clearTimeout(debounce);
  }, [password, context, onValidationChange]);

  if (!password || !validation) return null;

  const strengthColor = {
    0: 'bg-red-500',
    1: 'bg-orange-500',
    2: 'bg-yellow-500',
    3: 'bg-green-500',
    4: 'bg-green-600',
  }[validation.score];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Password Strength</span>
          <span className={validation.isStrong ? 'text-green-500' : 'text-red-500'}>
            {validation.isStrong ? 'Strong' : 'Weak'}
          </span>
        </div>
        <Progress
          value={(validation.score / 4) * 100}
          className={`h-1 ${strengthColor}`}
        />
      </div>

      {validation.feedback.warning && (
        <Alert variant="warning">
          <AlertDescription>{validation.feedback.warning}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {validation.feedback.suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {validation.failedPolicies.includes(suggestion) ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <span>{suggestion}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 