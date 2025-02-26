import React from 'react';
import { Alert, AlertIcon, AlertDescription } from '@chakra-ui/react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps): JSX.Element {
  return (
    <Alert status="error">
      <AlertIcon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
} 