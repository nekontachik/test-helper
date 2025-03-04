'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {

  getStrengthColor,
  validatePassword,
  type PasswordStrength
} from '@/lib/utils/password';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({
  password,
  className,
  showRequirements = true
}: PasswordStrengthMeterProps): JSX.Element {
  const validation = useMemo(() => validatePassword(password), [password]);
  const color = useMemo(() => getStrengthColor(validation.strength), [validation.strength]);

  const strengthText: Record<PasswordStrength, string> = {
    'weak': 'Weak',
    'medium': 'Medium',
    'strong': 'Strong',
    'very-strong': 'Very Strong'
  };

  const passedChecks = Object.values(validation.checks).filter(Boolean).length;
  const totalChecks = Object.keys(validation.checks).length;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', color)}
          style={{
            width: `${(passedChecks / totalChecks) * 100}%`
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{password ? strengthText[validation.strength] : 'Password strength'}</span>
        <span>
          {passedChecks}/{totalChecks} requirements met
        </span>
      </div>
      {showRequirements && validation.errors.length > 0 && (
        <ul className="text-xs space-y-1 text-gray-500">
          {validation.errors.map((error, index) => (
            <li key={index} className="text-red-500">
              • {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 