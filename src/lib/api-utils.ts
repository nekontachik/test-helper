import type { ApiResponse } from '@/types/api';

type ApiErrorResponse = {
  code: string;
  message: string;
  details?: unknown;
};

export const handleApiError = (error: unknown): ApiResponse<never> => {
  const errorResponse: ApiErrorResponse = {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred'
  };

  if (error instanceof Error) {
    errorResponse.code = error.name;
    errorResponse.message = error.message;
    if (error.cause) {
      errorResponse.details = error.cause;
    }
  }

  return {
    success: false,
    message: errorResponse.message,
    status: 500,
    error: {
      code: errorResponse.code,
      details: errorResponse.details
    }
  };
}; 