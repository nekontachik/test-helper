'use client';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputProps,
} from '@chakra-ui/react';
import { UseFormRegisterReturn } from 'react-hook-form';

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
}: AuthFormFieldProps) {
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
