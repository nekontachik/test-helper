'use client';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/form-control';
import type { InputProps } from '@chakra-ui/input';
import { Input } from '@chakra-ui/input';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface FormFieldProps extends Omit<InputProps, 'name'> {
  label: string;
  name: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  isRequired?: boolean;
}

export function FormField({
  label,
  name,
  error,
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
      {error && (
        <FormErrorMessage>{error}</FormErrorMessage>
      )}
    </FormControl>
  );
}
