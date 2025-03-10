'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { logger } from '@/lib/logger';
import { FiAlertCircle as AlertCircle, FiRefreshCw as RefreshCw, FiHome as Home, FiArrowLeft as ArrowLeft } from 'react-icons/fi';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorCode?: string;
}

// Define custom API error type
interface ApiError extends Error {
  code?: string;
}

// Error messages for different error codes
const ERROR_MESSAGES = {
  DEFAULT: 'An unexpected error occurred. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  SERVER_ERROR: 'Server error. Our team has been notified and is working on a fix.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access to this resource is forbidden.',
  VALIDATION_ERROR: 'There was an error with the data you submitted. Please check and try again.',
  TIMEOUT: 'The request timed out. Please try again later.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
} as const;

type ErrorCode = keyof typeof ERROR_MESSAGES;

/**
 * Extract error code from error message
 */
function getErrorCodeFromMessage(message: string): ErrorCode {
  if (!message) return 'DEFAULT';
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'NETWORK_ERROR';
  } else if (message.includes('timeout')) {
    return 'TIMEOUT';
  } else if (message.includes('not found') || message.includes('404')) {
    return 'NOT_FOUND';
  } else if (message.includes('unauthorized') || message.includes('401')) {
    return 'UNAUTHORIZED';
  } else if (message.includes('forbidden') || message.includes('403')) {
    return 'FORBIDDEN';
  } else if (message.includes('validation')) {
    return 'VALIDATION_ERROR';
  } else if (message.includes('rate limit') || message.includes('429')) {
    return 'RATE_LIMITED';
  } else if (message.includes('server error') || message.includes('500')) {
    return 'SERVER_ERROR';
  }
  
  return 'DEFAULT';
}

/**
 * Get user-friendly error message based on error code
 */
function getUserFriendlyMessage(errorCode: ErrorCode | undefined): string {
  if (!errorCode) return ERROR_MESSAGES.DEFAULT;
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.DEFAULT;
}

/**
 * Error message component
 */
export function ErrorMessage({ 
  error, 
  errorCode 
}: { 
  error?: Error; 
  errorCode?: string;
}): JSX.Element {
  // Determine the error code to use
  const derivedErrorCode = errorCode as ErrorCode || 
    (error?.message ? getErrorCodeFromMessage(error.message) : 'DEFAULT');
  
  // Get the user-friendly message
  const message = getUserFriendlyMessage(derivedErrorCode);
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {message}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-2 text-xs opacity-80">
            <div>Error: {error.message}</div>
            {errorCode && <div>Code: {errorCode}</div>}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Global error boundary component
 */
export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Extract error code if available
    const apiError = error as ApiError;
    const errorCode = apiError.code || getErrorCodeFromMessage(error.message);
    
    return { 
      hasError: true, 
      error,
      errorCode,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to our error tracking service
    logger.error('Error caught by GlobalErrorBoundary', {
      error,
      errorInfo,
      errorCode: this.state.errorCode,
    });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Create a fallback with the error information
      const error = this.state.error;
      const errorCode = this.state.errorCode as ErrorCode;
      
      return (
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
                <span>Something went wrong</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VStack spacing="4" align="stretch">
                <p className="text-base">
                  {getUserFriendlyMessage(errorCode)}
                </p>
                
                {process.env.NODE_ENV === 'development' && error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Developer Information</AlertTitle>
                    <AlertDescription>
                      <div className="text-xs font-mono whitespace-pre-wrap break-words">
                        {error.name}: {error.message}
                        {errorCode && <div>Error Code: {errorCode}</div>}
                        {error.stack && <div className="mt-2">{error.stack}</div>}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </CardContent>
            <CardFooter>
              <HStack spacing="2" className="w-full justify-between">
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </HStack>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
} 