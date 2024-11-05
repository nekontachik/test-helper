'use client';

import {
  Alert as ChakraAlert,
  AlertDescription as ChakraAlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/alert';
import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant?: 'subtle' | 'solid' | 'left-accent' | 'top-accent' | 'destructive';
  status?: 'info' | 'warning' | 'success' | 'error';
}

export function Alert({ children, variant = 'subtle', status = 'info', ...props }: AlertProps) {
  return (
    <ChakraAlert status={status} variant={variant} {...props}>
      <AlertIcon />
      {children}
    </ChakraAlert>
  );
}

interface AlertDescriptionProps {
  children: ReactNode;
}

export function AlertDescription({ children }: AlertDescriptionProps) {
  return <ChakraAlertDescription>{children}</ChakraAlertDescription>;
}