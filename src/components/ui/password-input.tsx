'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PasswordStrengthMeter } from './password-strength-meter';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /**
   * Whether to show the password strength meter
   * @default false
   */
  showStrengthMeter?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthMeter = false, onChange, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    
    const togglePasswordVisibility = (e: React.MouseEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword(!showPassword);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-10 bg-white text-black', className)}
            onChange={onChange}
            value={value}
            ref={ref}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? 'Hide password' : 'Show password'}
            </span>
          </Button>
        </div>
        {showStrengthMeter && typeof value === 'string' && (
          <PasswordStrengthMeter password={value} />
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput'; 