'use client';

import { useState, useCallback } from 'react';
import { getUserFriendlyMessage } from '@/lib/client/errorHandler';

export interface ApiErrorState {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  hasError: boolean;
}

interface ErrorWithCode {
  code?: string;
  fieldErrors?: Record<string, string>;
}

interface ValidationErrorDetail {
  path: string;
  message: string;
}

/**
 * Custom hook for handling API errors in forms
 */
export function useApiError(): {
  error: ApiErrorState;
  setApiError: (errorData: unknown) => void;
  clearError: () => void;
  handleApiResponseError: (response: Response) => Promise<void>;
} {
  const [error, setError] = useState<ApiErrorState>({
    message: '',
    hasError: false
  });

  /**
   * Clears the current error state
   */
  const clearError = useCallback((): void => {
    setError({
      message: '',
      hasError: false
    });
  }, []);

  /**
   * Sets an error with a user-friendly message
   */
  const setApiError = useCallback((errorData: unknown): void => {
    // Default error state
    const newError: ApiErrorState = {
      message: 'An unexpected error occurred',
      hasError: true
    };

    // Handle different error types
    if (errorData instanceof Error) {
      // Handle standard Error objects
      newError.message = errorData.message;
      
      // Check if it's an API error with a code
      if ('code' in errorData && typeof (errorData as ErrorWithCode).code === 'string') {
        const code = (errorData as ErrorWithCode).code;
        if (code) {
          newError.code = code;
          newError.message = getUserFriendlyMessage(code);
        }
      }
      
      // Check for field errors
      if ('fieldErrors' in errorData && (errorData as ErrorWithCode).fieldErrors) {
        newError.fieldErrors = (errorData as ErrorWithCode).fieldErrors;
      }
    } else if (typeof errorData === 'string') {
      // Handle string errors
      newError.message = errorData;
    } else if (errorData && typeof errorData === 'object') {
      // Handle error response objects
      const errorObj = errorData as Record<string, unknown>;
      
      if (typeof errorObj.message === 'string') {
        newError.message = errorObj.message;
      } else if (errorObj.error) {
        newError.message = typeof errorObj.error === 'string' 
          ? errorObj.error 
          : 'An error occurred';
      }
      
      if (typeof errorObj.code === 'string') {
        newError.code = errorObj.code;
        // Use the user-friendly message if we have a code
        newError.message = getUserFriendlyMessage(errorObj.code);
      }
      
      // Handle validation errors
      if (errorObj.details && Array.isArray(errorObj.details)) {
        newError.fieldErrors = {};
        (errorObj.details as ValidationErrorDetail[]).forEach((detail) => {
          if (detail.path && detail.message) {
            if (newError.fieldErrors) {
              newError.fieldErrors[detail.path] = detail.message;
            }
          }
        });
      }
    }

    setError(newError);
  }, []);

  /**
   * Handles an API response error
   */
  const handleApiResponseError = useCallback(async (response: Response): Promise<void> => {
    try {
      const data = await response.json();
      setApiError(data);
    } catch {
      // If we can't parse the JSON, use the status and statusText
      setApiError(new Error(`${response.status} ${response.statusText}`));
    }
  }, [setApiError]);

  return {
    error,
    setApiError,
    clearError,
    handleApiResponseError
  };
} 