'use client';

import { Button, ButtonProps } from '@chakra-ui/react';

export interface AuthButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export function AuthButton({ 
  children, 
  isLoading, 
  ...props 
}: AuthButtonProps) {
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
