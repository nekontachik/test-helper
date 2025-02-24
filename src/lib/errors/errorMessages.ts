// import { ErrorType } from './BaseError';
import { AppError } from './types';
import type { ErrorSeverity } from './types';
import type { ErrorCode } from './errorTypes';

interface ErrorDetails {
  title: string;
  description: string;
  severity: ErrorSeverity;
  action?: string;
}

const ERROR_MESSAGES: Record<ErrorCode, ErrorDetails> = {
  VALIDATION_ERROR: {
    title: 'Validation Error',
    description: 'Please check your input and try again',
    severity: 'warning'
  },
  NOT_FOUND: {
    title: 'Not Found',
    description: 'The requested resource could not be found',
    severity: 'warning'
  },
  UNAUTHORIZED: {
    title: 'Unauthorized',
    description: 'Please sign in to continue',
    severity: 'error'
  },
  FORBIDDEN: {
    title: 'Access Denied',
    description: 'You do not have permission to perform this action',
    severity: 'error'
  },
  PROCESSING_ERROR: {
    title: 'Processing Error',
    description: 'An error occurred while processing your request',
    severity: 'error'
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    description: 'Please check your connection and try again',
    severity: 'error'
  },
  TIMEOUT_ERROR: {
    title: 'Request Timeout',
    description: 'The operation took too long to complete',
    severity: 'error'
  },
  DATABASE_ERROR: {
    title: 'Database Error',
    description: 'An error occurred while accessing the database',
    severity: 'error'
  },
  RATE_LIMITED: {
    title: 'Too Many Requests',
    description: 'Please wait a moment before trying again',
    severity: 'warning'
  },
  INTERNAL_ERROR: {
    title: 'Internal Error',
    description: 'An unexpected error occurred',
    severity: 'error'
  },
  UNKNOWN_ERROR: {
    title: 'Error',
    description: 'An unknown error occurred',
    severity: 'error'
  },
  SERVER_ERROR: {
    title: 'Server Error',
    description: 'An error occurred on the server',
    severity: 'error'
  }
} as const;

export function getErrorMessage(error: Error & { code?: ErrorCode }): ErrorDetails {
  const code = error.code || 'UNKNOWN_ERROR';
  const message = ERROR_MESSAGES[code];
  
  return {
    ...message,
    description: error.message || message.description
  };
}

export function getErrorSeverity(code: ErrorCode): ErrorSeverity {
  return ERROR_MESSAGES[code]?.severity || 'error';
}

export function getErrorTitle(code: ErrorCode): string {
  return ERROR_MESSAGES[code]?.title || ERROR_MESSAGES.UNKNOWN_ERROR.title;
}

export const errorMessages = ERROR_MESSAGES;

export function createErrorMessage(
  code: ErrorCode, 
  customMessage?: string, 
  customAction?: string
): ErrorDetails {
  const baseMessage = ERROR_MESSAGES[code];
  return {
    ...baseMessage,
    description: customMessage || baseMessage.description,
    action: customAction || baseMessage.action
  };
} 