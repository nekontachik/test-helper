import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

interface ErrorAlertProps {
  error?: Error;
  message?: string;
}

export function ErrorAlert({ error, message }: ErrorAlertProps) {
  const errorMessage = error?.message || message || 'An error occurred';
  
  return (
    <Alert status="error" variant="left-accent" borderRadius="md">
      <AlertIcon />
      <div>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </div>
    </Alert>
  );
} 