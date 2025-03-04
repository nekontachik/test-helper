'use client';

import { PasswordInput } from '@/components/PasswordInput';
import type { ChangeEvent } from 'react';
import type { PasswordInputWrapperProps } from './types';

export function PasswordInputWrapper({ 
  register, 
  name, 
  placeholder, 
  value 
}: PasswordInputWrapperProps): JSX.Element {
  const { onChange, ...rest } = register(name);
  
  return (
    <PasswordInput
      {...rest}
      onValueChange={(newValue) => {
        const syntheticEvent = {
          target: { value: newValue, name }
        } as unknown as ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }}
      value={value}
      placeholder={placeholder}
    />
  );
} 