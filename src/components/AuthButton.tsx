'use client';

import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';

export interface AuthButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export function AuthButton({ 
  children, 
  isLoading, 
  ...props 
}: AuthButtonProps): JSX.Element {
  return (
    <Button
      width="full"
      colorScheme="blue"
      isLoading={isLoading}
      {...props}
    >
      {children}
    </Button>
  );
}
