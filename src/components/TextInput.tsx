import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from '@chakra-ui/react';
import type { InputProps as ChakraInputProps } from '@chakra-ui/react';

interface TextInputProps extends Omit<ChakraInputProps, 'onChange'> {
  label: string;
  name: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({
  label,
  name,
  error,
  value,
  onChange,
  ...props
}: TextInputProps): JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Input
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        {...props}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
}
