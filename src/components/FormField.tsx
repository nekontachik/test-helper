'use client';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  FormHelperText,
  InputProps,
} from '@chakra-ui/react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormFieldProps extends Omit<InputProps, 'name'> {
  label: string;
  name: string;
  error?: string;
  helperText?: string;
  registration?: UseFormRegisterReturn;
  isRequired?: boolean;
}

export function FormField({
  label,
  name,
  error,
  helperText,
  registration,
  isRequired,
  ...props
}: FormFieldProps) {
  return (
    <FormControl isInvalid={!!error} isRequired={isRequired}>
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
