'use client';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/form-control';
import type { ReactNode } from 'react';

interface FieldProps {
  children: ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  invalid?: boolean;
}

export function Field({
  children,
  label,
  error,
  helperText,
  required,
  invalid,
}: FieldProps): JSX.Element {
  return (
    <FormControl isInvalid={invalid || !!error} isRequired={required}>
      {label && <FormLabel>{label}</FormLabel>}
      {children}
      {error ? (
        <FormErrorMessage>{error}</FormErrorMessage>
      ) : helperText ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
} 