'use client';

/**
 * Error codes and their user-friendly messages
 */
const ERROR_MESSAGES = {
  'NOT_FOUND': 'The requested resource could not be found.',
  'UNAUTHORIZED': 'You do not have permission to access this resource.',
  'FORBIDDEN': 'Access to this resource is forbidden.',
  'VALIDATION_ERROR': 'The data provided is invalid.',
  'NETWORK_ERROR': 'There was a problem connecting to the server.',
  'SERVER_ERROR': 'The server encountered an error while processing your request.',
  'CONFLICT': 'The request could not be completed due to a conflict with the current state of the resource.',
  'BAD_REQUEST': 'The request was invalid or cannot be otherwise served.',
  'RATE_LIMIT_EXCEEDED': 'You have exceeded the rate limit. Please try again later.',
  'DEFAULT': 'An unexpected error occurred. Our team has been notified.'
} as const;

export interface ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
}

/**
 * Gets a user-friendly error message based on the error code
 */
export function getUserFriendlyMessage(errorCode: string): string {
  return errorCode in ERROR_MESSAGES 
    ? ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] 
    : ERROR_MESSAGES.DEFAULT;
}

/**
 * Creates an API error with the given code, message, and status
 */
export function createApiError(code: string, message: string, status = 500, details?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.status = status;
  error.details = details;
  return error;
}

interface ErrorResponseData {
  code: string;
  message: string;
  details?: unknown;
}

interface ErrorResponse {
  error: ErrorResponseData;
}

export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ErrorResponse).error === 'object' &&
    'code' in (response as ErrorResponse).error &&
    'message' in (response as ErrorResponse).error
  );
} 