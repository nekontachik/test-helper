'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorMessage } from '@/components/error-message/ErrorMessage';
import { useRouter } from 'next/navigation';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps): JSX.Element {
  const { handleError } = useErrorHandler();
  const router = useRouter();

  const handleReset = (): void => {
    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Attempt to refresh the page
    router.refresh();
  };

  const handleAuthError = (error: Error): void => {
    // Check if this is an authentication error
    if (error.message?.includes('authentication') || 
        error.message?.includes('unauthorized') || 
        error.message?.includes('not authenticated') ||
        error.name === 'AuthenticationError') {
      // Redirect to signin page
      router.push('/auth/signin');
      return;
    }
    
    // Handle other errors
    handleError(error, { context: 'Error Boundary Caught Error' });
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        fallback || (
          <ErrorMessage
            error={error}
            onRetry={resetErrorBoundary}
            variant="full"
          />
        )
      )}
      onReset={handleReset}
      onError={handleAuthError}
    >
      {children}
    </ReactErrorBoundary>
  );
} 