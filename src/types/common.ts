// Define shared interfaces/types here
export interface CommonResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Add more common types
export type ErrorResponse = {
  message: string;
  code?: string;
  status: number;
}

export type ApiResponse<T> = CommonResponse<T> | ErrorResponse;

// Common status types
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Common form states
export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// Pagination type
export type PaginationParams = {
  page: number;
  limit: number;
  total?: number;
} 