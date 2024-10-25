import logger from './logger';
import { ZodError } from 'zod';

interface ErrorReport {
  errorId: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  componentStack: string;
  userInfo?: {
    id?: string;
    email?: string;
  };
  metadata?: Record<string, unknown>;
}

export const reportErrorToService = async (
  error: Error,
  errorInfo: React.ErrorInfo,
  errorId: string
): Promise<void> => {
  const errorReport: ErrorReport = {
    errorId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    componentStack: errorInfo.componentStack || '',
    userInfo: {},
    metadata: {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'Server-side error',
    },
  };

  logger.error('Error report:', errorReport);

  try {
    await sendErrorReport(errorReport);
    logger.info(`Error report sent successfully. Error ID: ${errorId}`);
  } catch (reportingError) {
    logger.error('Failed to send error report:', reportingError);
  }
};

const sendErrorReport = async (errorReport: ErrorReport): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Error report sent to service:', errorReport);
};

/**
 * Custom error class for API-specific errors.
 * Allows specifying a status code along with the error message.
 */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handles various types of errors and returns a standardized error response.
 * @param error - The error to handle
 * @returns An object with a message and status code suitable for API responses
 */
export function handleApiError(error: unknown): { message: string; status: number } {
  if (error instanceof ZodError) {
    return {
      message: `Validation error: ${error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ')}`,
      status: 400,
    };
  }

  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      message: `Internal server error: ${error.message}`,
      status: 500,
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}

/**
 * Logs errors with additional context information.
 * @param error - The error to log
 * @param context - Optional additional context about the error
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error('Error:', {
    message: errorMessage,
    stack: errorStack,
    context,
  });
}

/**
 * Simple error reporting utility.
 */
export const errorReporting = {
  /**
   * Logs an error message along with the error object.
   * @param message - A descriptive error message
   * @param error - The error object to log
   */
  logError: (message: string, error: unknown): void => {
    console.error(message, error);
    logError(error, { customMessage: message });
  }
};
