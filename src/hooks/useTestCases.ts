import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { TestCase, TestCaseStatus, TestCasePriority, PaginatedResponse, TestCaseFormData } from '@/types';
import { useErrorHandler } from './useErrorHandler';

interface UseTestCasesOptions {
  page?: number;
  limit?: number;
  status?: TestCaseStatus | null;
  priority?: TestCasePriority | null;
  search?: string;
}

export function useTestCases(projectId: string, options: UseTestCasesOptions = {}) {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  // Fetch test cases with pagination and filtering
  const fetchTestCases = async () => {
    try {
      const response = await apiClient.getTestCases(projectId, {
        page: options.page || 1,
        limit: options.limit || 10,
        status: options.status,
        priority: options.priority,
        search: options.search,
      });
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  // Create a new test case
  const createTestCase = async (testCaseData: TestCaseFormData) => {
    try {
      const response = await apiClient.createTestCase(projectId, testCaseData);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  // Use React Query's useMutation for creating test cases
  const mutation = useMutation(createTestCase, {
    onSuccess: () => {
      // Invalidate and refetch test cases query after successful creation
      queryClient.invalidateQueries(['testCases', projectId]);
    },
  });

  return {
    // Fetch test cases using React Query's useQuery
    ...useQuery(['testCases', projectId, options], fetchTestCases),
    createTestCase: mutation.mutate,
    isCreating: mutation.isLoading,
    createError: mutation.error,
  };
}

export function useCreateTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; testCase: TestCaseFormData }) =>
      apiClient.createTestCase(data.projectId, data.testCase),
    onSuccess: (_newTestCase: TestCase, variables: { projectId: string }) => {
      queryClient.invalidateQueries(['testCases', variables.projectId]);
    },
  });
}

export function useTestCase(projectId: string, testCaseId: string) {
  return useQuery(['testCase', projectId, testCaseId], () =>
    apiClient.getTestCase(projectId, testCaseId)
  );
}

export function useUpdateTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; testCaseId: string; testCase: Partial<TestCaseFormData> }) =>
      apiClient.updateTestCase(data.projectId, data.testCaseId, data.testCase),
    onSuccess: (_updatedTestCase: TestCase, variables: { projectId: string; testCaseId: string }) => {
      queryClient.invalidateQueries(['testCases', variables.projectId]);
      queryClient.invalidateQueries(['testCase', variables.projectId, variables.testCaseId]);
    },
  });
}
