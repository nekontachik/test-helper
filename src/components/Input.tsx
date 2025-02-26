import React from 'react';
import { Input as ChakraInput } from '@chakra-ui/react';
import type { InputProps as ChakraInputProps } from '@chakra-ui/input';

export const Input: React.FC<ChakraInputProps> = (props) => {
  return <ChakraInput {...props} />;
};

export type { ChakraInputProps as InputProps };
