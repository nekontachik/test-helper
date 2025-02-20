import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { TestCase, TestCaseFormData } from '@/types';
import { createMutationHook } from '@/lib/hooks/createMutationHook';
import { queryClient } from '@/lib/queryClient';
import { ROUTES } from '@/lib/routes';
import { ApiError } from '@/lib/api/errorHandler';

export function useTestCase(projectId: string, testCaseId: string) {
  return useQuery({
    queryKey: ['testCase', projectId, testCaseId],
    queryFn: () => apiClient.getTestCase(projectId, testCaseId),
    enabled: !!projectId && !!testCaseId,
  });
}

export const useCreateTestCase = createMutationHook<TestCase, TestCaseInput>(
  {
    mutationFn: async (input) => {
      const response = await fetch(ROUTES.API.TEST_CASES.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(error.message, response.status);
      }
      
      return response.json();
    },
    invalidateQueries: ['testCases'],
    onSuccess: (data) => {
      // Additional success handling
    },
    onError: (error) => {
      // Error handling
    }
  },
  queryClient
);

export function useTestCaseVersions(projectId: string, testCaseId: string) {
  return useQuery({
    queryKey: ['testCaseVersions', projectId, testCaseId],
    queryFn: () => apiClient.getTestCaseVersions(projectId, testCaseId),
    enabled: !!projectId && !!testCaseId,
  });
}

export function useRestoreTestCaseVersion(projectId: string, testCaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionNumber: number) => 
      apiClient.restoreTestCaseVersion(projectId, testCaseId, versionNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCase', projectId, testCaseId] });
      queryClient.invalidateQueries({ queryKey: ['testCaseVersions', projectId, testCaseId] });
    },
  });
}

export function useUpdateTestCase(projectId: string, testCaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestCaseFormData) => 
      apiClient.updateTestCase(projectId, testCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCase', projectId, testCaseId] });
    },
  });
}
