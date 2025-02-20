import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { ErrorDisplay } from '../ErrorDisplay';
import { TestRunError, TestResultError, FileUploadError } from '@/lib/errors/specific/testErrors';
import { logger } from '@/lib/utils/logger';
import { useToast } from '@/hooks/useToast';

interface Props {
  children: React.ReactNode;
  onRetry?: () => void;
  onReset?: () => void;
}

export function TestRunErrorBoundary({ children, onRetry, onReset }: Props) {
  const { toast } = useToast();

  const renderError = React.useCallback((error: Error) => {
    logger.error('Test run error:', error);

    let message = 'An error occurred while processing the test run';
    let code = 'TEST_RUN_ERROR';
    let canRetry = true;

    if (error instanceof TestRunError) {
      message = error.message;
      code = error.code;
      // Don't allow retries for server-side errors
      canRetry = error.status < 500;
    } else if (error instanceof TestResultError) {
      message = error.message;
      code = error.code;
      // Allow retries for validation errors
      canRetry = error.status === 400;
    } else if (error instanceof FileUploadError) {
      message = error.message;
      code = error.code;
      // Always allow retries for file uploads
      canRetry = true;
    }

    // Show toast for non-retryable errors
    if (!canRetry) {
      toast({
        title: "Error",
        description: "This operation cannot be retried. Please start over.",
        variant: "destructive"
      });
    }

    return (
      <ErrorDisplay
        message={message}
        code={code}
        onRetry={canRetry ? onRetry : undefined}
        onReset={!canRetry ? onReset : undefined}
      />
    );
  }, [onRetry, onReset, toast]);

  const handleError = React.useCallback((error: Error) => {
    logger.error('Test run error boundary caught:', error);
    
    // Log additional context if available
    if ('details' in error && typeof (error as any).details === 'object') {
      logger.error('Error details:', (error as any).details);
    }

    return renderError(error);
  }, [renderError]);

  return (
    <ErrorBoundary 
      onError={handleError}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
} 