'use client';

import * as React from 'react';
import { PasswordInput as UIPasswordInput } from '@/components/ui/password-input';

interface PasswordInputProps {
  value: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  showStrengthMeter?: boolean;
  onValueChange?: (value: string) => void;
  id?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  'aria-describedby'?: string | undefined;
}

// Wrapper around the UI version for backward compatibility
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    value,
    name = 'password',
    placeholder = '••••••••',
    disabled = false,
    required = false,
    autoComplete = 'current-password',
    error,
    showStrengthMeter = true,
    onValueChange,
    ...props
  }, ref) => {
    return (
      <div className="space-y-2">
        <UIPasswordInput
          {...props}
          name={name}
          value={value}
          onChange={(e) => {
            if (onValueChange) onValueChange(e.target.value);
            if (props.onChange) props.onChange(e);
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          showStrengthMeter={showStrengthMeter}
          ref={ref}
        />
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
