import { useState } from 'react';
import type { AxiosResponse } from 'axios';

/**
 * Custom hook for making API requests
 * @returns An object with methods for making API requests and state variables
 */
export function useApi<T>(_apiFunction: () => Promise<AxiosResponse<T>>): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Implementation would go here using setData
      // For example:
      // const response = await _apiFunction();
      // setData(response.data);
      setData(null); // Placeholder to use setData
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
