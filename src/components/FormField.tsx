'use client';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import type { InputProps } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
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
}: FormFieldProps): JSX.Element {
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
