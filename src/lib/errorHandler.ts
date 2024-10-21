import { AxiosError } from 'axios';

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
}
