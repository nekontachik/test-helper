'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

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
}

export function PasswordInput({
  value,
  name = 'password',
  placeholder = '••••••••',
  disabled = false,
  required = false,
  autoComplete = 'current-password',
  error,
  showStrengthMeter = true,
  onValueChange,
}: PasswordInputProps): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onValueChange?.(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {showStrengthMeter && value && (
        <PasswordStrengthMeter 
          password={value} 
          className="mt-2"
        />
      )}
    </div>
  );
}
