import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from '@chakra-ui/react';
import type { InputProps } from '@chakra-ui/input';

interface TextInputProps extends Omit<InputProps, 'onChange'> {
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
}: TextInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
