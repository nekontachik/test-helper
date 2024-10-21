import { AxiosResponse } from 'axios';

/**
 * Custom hook for making API requests
 * @returns An object with methods for making API requests and state variables
 */
export function useApi<T>(apiFunction: () => Promise<AxiosResponse<T>>) {
  // Implementation
}
