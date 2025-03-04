'use client';

import { forwardRef, useState } from 'react';
import type { InputProps } from '@/components/ui/input';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PasswordStrengthMeter } from './password-strength-meter';

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /**
   * Whether to show the password strength meter
   * @default false
   */
  showStrengthMeter?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthMeter = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-10', className)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            disabled={props.disabled}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
            <span className="sr-only">
              {showPassword ? 'Hide password' : 'Show password'}
            </span>
          </Button>
        </div>
        {showStrengthMeter && props.value && (
          <PasswordStrengthMeter password={props.value.toString()} />
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput'; 