import { useQuery } from '@tanstack/react-query';
import { TestCase } from '@prisma/client';
import apiClient from '@/lib/apiClient';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

interface UseTestCasesOptions {
  page?: number;
  limit?: number;
}

export function useTestCases(projectId: string, options: UseTestCasesOptions = {}) {
  const { page = 1, limit = 10 } = options;

  return useQuery({
    queryKey: ['testCases', projectId, page, limit],
    queryFn: async () => {
      const response = await apiClient.getTestCases(projectId, { page, limit }) as unknown as PaginatedResponse<TestCase>;
      return response.data;
    },
    enabled: !!projectId,
  });
}
