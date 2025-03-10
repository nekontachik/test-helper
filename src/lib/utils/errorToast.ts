// Create a singleton toast instance
import type { useToast as useToastUI } from "@/components/ui/use-toast";
import { getUserFriendlyMessage } from '@/lib/client/errorHandler';
import type { ReactNode } from 'react';

interface ErrorToastOptions {
  title?: string;
  description?: string | ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Create a singleton toast function that doesn't require React hooks
let toastFn: ReturnType<typeof useToastUI>['toast'] | null = null;

// This function should be called once during app initialization
export function initializeToast(toast: ReturnType<typeof useToastUI>['toast']): void {
  toastFn = toast;
}

/**
 * Displays an error toast with a user-friendly message
 */
export function showErrorToast(
  error: unknown,
  options: ErrorToastOptions = {}
): void {
  // Default options
  const {
    title = 'Error',
    variant = 'destructive',
    duration = 5000,
  } = options;

  // Extract error message and code
  let errorCode = 'DEFAULT';

  if (error instanceof Error) {
    // Check if it's an API error with a code
    if ('code' in error && typeof error.code === 'string') {
      errorCode = error.code;
    }
  }

  // Get user-friendly message based on error code or message
  const userFriendlyMessage = options.description || getUserFriendlyMessage(errorCode);

  // Show toast if initialized
  if (toastFn) {
    toastFn({
      title,
      description: String(userFriendlyMessage),
      variant,
      duration,
    });
  } else {
    // Fallback to console if toast not initialized
    console.error('Toast not initialized. Error:', error, 'Message:', userFriendlyMessage);
  }

  // Log the error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }
}

/**
 * Displays a validation error toast with field-specific messages
 */
export function showValidationErrorToast(
  validationErrors: Array<{ path: string; message: string }>,
  options: ErrorToastOptions = {}
): void {
  // Default options
  const {
    title = 'Validation Error',
    variant = 'destructive',
    duration = 7000,
  } = options;

  // Create a formatted description string
  const description = `Please fix the following errors: ${validationErrors
    .map((error) => `${error.path}: ${error.message}`)
    .join(', ')}`;

  // Show toast if initialized
  if (toastFn) {
    toastFn({
      title,
      description,
      variant,
      duration,
    });
  } else {
    // Fallback to console if toast not initialized
    console.error('Toast not initialized. Validation errors:', validationErrors);
  }
}

/**
 * Handles API response errors and displays appropriate toasts
 */
export async function handleApiResponseError(
  response: Response,
  options: ErrorToastOptions = {}
): Promise<void> {
  try {
    // Try to parse the error response
    const data = await response.json();
    
    // Check if it's a validation error with details
    if (data.code === 'VALIDATION_ERROR' && Array.isArray(data.details)) {
      showValidationErrorToast(data.details, {
        title: options.title || 'Validation Error',
        ...options,
      });
      return;
    }
    
    // Use the server-provided message if available
    const description = data.message || options.description || getUserFriendlyMessage(data.code || 'DEFAULT');
    
    showErrorToast(new Error(data.error || 'API Error'), {
      ...options,
      description,
    });
  } catch {
    // If we can't parse the response, show a generic error
    showErrorToast(
      new Error(`${response.status} ${response.statusText}`),
      options
    );
  }
} 