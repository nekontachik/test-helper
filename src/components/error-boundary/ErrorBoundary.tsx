import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorMessage } from '@/components/error-message/ErrorMessage';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const { handleError } = useErrorHandler();

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
      onReset={() => {
        localStorage.clear();
        sessionStorage.clear();
      }}
      onError={(error) => handleError(error, { context: 'Error Boundary Caught Error' })}
    >
      {children}
    </ReactErrorBoundary>
  );
} 