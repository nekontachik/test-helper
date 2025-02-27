import type { Session } from 'next-auth';
import type { AuthUser } from '@/lib/auth/types';
import type { TestRun, TestResult } from './testRun';
import type { CommonResponse, ErrorResponse } from './common';

// Request types
export interface RequestWithSession extends Request {
  session?: Session;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
  url: string;
}

// Consolidate with CommonResponse
export type ApiSuccessResponse<T> = CommonResponse<T> & {
  success: true;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

// Consolidate with ErrorResponse
export type ApiErrorResponse = ErrorResponse & {
  success: false;
  error: {
    code: string;
    details?: unknown;
  };
};

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

// Query types
export interface QueryFilters {
  field: string;
  operator: 'equals' | 'contains' | 'in';
  value: unknown;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  filters?: QueryFilters[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Update helper function return types
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    status: 200, // Add required CommonResponse field
    meta,
  };
}

export function createErrorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    message,
    status: 500, // Add required ErrorResponse field
    error: {
      code,
      details,
    },
  };
}

// Specific API response types
export type TestRunResponse = ApiSuccessResponse<TestRun> | ApiErrorResponse;
export type TestResultsResponse = ApiSuccessResponse<TestResult[]> | ApiErrorResponse;

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiConfig = {
  method?: ApiMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
};

export type ApiClient = {
  fetch: <T>(endpoint: string, config?: ApiConfig) => Promise<CommonResponse<T>>;
  handleError: (error: unknown) => ErrorResponse;
};

// Add these utility types
export function isApiSuccessResponse<T>(
  response: ApiSuccessResponse<T> | ApiErrorResponse
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiErrorResponse(
  response: unknown
): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false
  );
}

// Type guard for PaginatedResponse
export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'items' in response &&
    'totalPages' in response &&
    'currentPage' in response
  );
}

// Export the combined type for route handlers
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse; 