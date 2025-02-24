import React from 'react';
import { Alert, AlertIcon, AlertTitle, AlertDescription, Box, Button } from '@chakra-ui/react';
import { getErrorMessage } from '@/lib/errors/errorMessages';
import type { ErrorCode } from '@/lib/errors/errorMessages';
import { AppError } from '@/lib/errors/types';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';

interface ErrorMessageProps {
  error: Error | AppError;
  onRetry?: () => void;
  variant?: 'toast' | 'inline' | 'full';
}

export function ErrorMessage({ error, onRetry, variant = 'inline' }: ErrorMessageProps) {
  // Convert any error to AppError for consistent handling
  const appError = error instanceof AppError 
    ? error 
    : ErrorFactory.create(
        'UNKNOWN_ERROR',
        error.message
      );

  const errorDetails = getErrorMessage(appError);
  
  const renderContent = () => (
    <>
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>{errorDetails.title}</AlertTitle>
        <AlertDescription display="block">
          {errorDetails.description}
          {errorDetails.action && (
            <Box mt={2} fontSize="sm">
              {errorDetails.action}
            </Box>
          )}
        </AlertDescription>
      </Box>
      {onRetry && (
        <Button
          size="sm"
          onClick={onRetry}
          ml={2}
          colorScheme="blue"
          variant="outline"
        >
          Try Again
        </Button>
      )}
    </>
  );

  switch (variant) {
    case 'toast':
      return (
        <Alert
          status={errorDetails.severity}
          variant="subtle"
          borderRadius="md"
        >
          {renderContent()}
        </Alert>
      );
    
    case 'full':
      return (
        <Alert
          status={errorDetails.severity}
          variant="solid"
          p={6}
          borderRadius="lg"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          {renderContent()}
        </Alert>
      );
    
    default:
      return (
        <Alert
          status={errorDetails.severity}
          variant="left-accent"
          borderRadius="md"
        >
          {renderContent()}
        </Alert>
      );
  }
} 