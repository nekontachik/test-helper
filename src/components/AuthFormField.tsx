'use client';

import type {
  InputProps} from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input
} from '@chakra-ui/react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface AuthFormFieldProps extends Omit<InputProps, 'name'> {
  label: string;
  name: string;
  error?: string;
  helperText?: string;
  registration?: UseFormRegisterReturn;
  isRequired?: boolean;
}

export function AuthFormField({
  label,
  name,
  error,
  helperText,
  registration,
  isRequired,
  ...props
}: AuthFormFieldProps): JSX.Element {
  return (
    <FormControl 
      isInvalid={!!error} 
      isRequired={isRequired}
    >
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Input
        id={name}
        {...registration}
        {...props}
      />
      {error ? (
        <FormErrorMessage>{error}</FormErrorMessage>
      ) : helperText ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
}
