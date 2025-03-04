'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SuccessMessageProps {
  message?: string;
}

export function SuccessMessage({ 
  message = 'Two-factor authentication has been successfully enabled for your account.' 
}: SuccessMessageProps): JSX.Element {
  return (
    <Alert>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

interface ErrorMessageProps {
  onRetry: () => void;
  message?: string;
}

export function ErrorMessage({ 
  onRetry, 
  message = 'Failed to set up two-factor authentication. Please try again.' 
}: ErrorMessageProps): JSX.Element {
  return (
    <Alert 
      variant="destructive"
      role="alert"
      aria-live="assertive"
    >
      <AlertDescription>{message}</AlertDescription>
      <Button 
        onClick={onRetry}
        variant="outline"
        className="mt-2"
      >
        Try Again
      </Button>
    </Alert>
  );
} 