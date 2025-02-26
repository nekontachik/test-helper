'use client';

import type {
  InputProps} from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage
} from '@chakra-ui/react';
import { forwardRef } from 'react';

interface AuthInputProps extends InputProps {
  label: string;
  error?: string;
  isRequired?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, isRequired, ...props }, ref) => {
    return (
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        <FormLabel>{label}</FormLabel>
        <Input ref={ref} {...props} />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    );
  }
);

AuthInput.displayName = 'AuthInput';
