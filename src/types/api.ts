import type { Session } from 'next-auth';
import type { NextRequest } from 'next/server';
import type { AuthUser } from '@/lib/auth/types';
import { TestRun, TestResult } from './testRun';

export interface RequestWithSession extends Request {
  session?: Session;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
  url: string;
}

// Generic API response types
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  message: string;
  code: number;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Specific API responses
export interface TestRunResponse extends ApiResponse<TestRun> {}
export interface TestResultsResponse extends ApiResponse<TestResult[]> {}

// API client helper
export const createApiResponse = <T>(data: T): ApiResponse<T> => ({ data });
export const createApiError = (message: string, code?: string): ApiError => ({
  error: { message, code }
});

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export type QueryFilters = {
  field: string;
  operator: 'equals' | 'contains' | 'in';
  value: any;
};

export interface QueryOptions {
  page?: number;
  limit?: number;
  filters?: QueryFilters[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 