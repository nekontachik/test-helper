import { useCallback } from 'react';
import { useTestCaseQuery } from './useTestCaseQuery';
import { useCreateTestCase, useUpdateTestCase, useDeleteTestCase } from './useTestCaseMutations';
import type { TestCase } from '@/lib/validations/testCase';
import type { TestCaseFilters } from '@/types/filters';

interface UseTestCasesOptions {
  projectId: string;
  initialFilters?: TestCaseFilters;
}

export function useTestCases({ projectId, initialFilters }: UseTestCasesOptions) {
  const query = useTestCaseQuery({ projectId, ...initialFilters });
  const createMutation = useCreateTestCase();
  const updateMutation = useUpdateTestCase();
  const deleteMutation = useDeleteTestCase();

  const createTestCase = useCallback(async (data: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createMutation.mutateAsync({ ...data, projectId });
  }, [createMutation, projectId]);

  const updateTestCase = useCallback(async (id: string, data: Partial<TestCase>) => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const deleteTestCase = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    testCases: query.data?.items ?? [],
    totalPages: query.data?.totalPages ?? 0,
    currentPage: query.data?.currentPage ?? 1,
    isLoading: query.isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading,
    error: query.error || createMutation.error || updateMutation.error || deleteMutation.error,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    refetch: query.refetch,
  };
}
