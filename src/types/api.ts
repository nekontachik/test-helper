import type { Session } from 'next-auth';
import type { AuthUser } from '@/lib/auth/types';
import type { TestRun, TestResult } from './testRun';

// Request types
export interface RequestWithSession extends Request {
  session?: Session;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
  url: string;
}

// Base response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

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

// API helpers
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
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
    error: {
      message,
      code,
      details,
    },
  };
}

// Specific API response types
export type TestRunResponse = ApiSuccessResponse<TestRun> | ApiErrorResponse;
export type TestResultsResponse = ApiSuccessResponse<TestResult[]> | ApiErrorResponse; 