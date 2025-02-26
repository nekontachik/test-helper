import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';
import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

export const Button: React.FC<ChakraButtonProps> = (props): JSX.Element => {
  return <ChakraButton {...props} />;
};

export type { ChakraButtonProps as ButtonProps };
