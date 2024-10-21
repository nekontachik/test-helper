import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';
import { ButtonProps as ChakraButtonProps } from '@chakra-ui/button';

export const Button: React.FC<ChakraButtonProps> = (props) => {
  return <ChakraButton {...props} />;
};

export type { ChakraButtonProps as ButtonProps };
