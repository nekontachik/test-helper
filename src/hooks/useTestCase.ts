'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { TestCase, TestCaseFormData } from '@/types';
import { createMutation } from '@/lib/hooks/createMutationHook';
import { ROUTES } from '@/lib/routes';
import { createApiError } from '@/lib/client/errorHandler';

interface QueryResult<T> {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

interface TestCaseInput {
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: string;
  steps?: Array<{description: string}>;
  tags?: string[];
}

export function useTestCase(projectId: string, testCaseId: string): QueryResult<TestCase> {
  return useQuery({
    queryKey: ['testCase', projectId, testCaseId],
    queryFn: () => apiClient.getTestCase(projectId, testCaseId),
    enabled: !!projectId && !!testCaseId,
  });
}

export const useCreateTestCase = createMutation<TestCase, TestCaseInput>({
  mutationFn: async (input: TestCaseInput) => {
    const response = await fetch(ROUTES.API.PROJECT.TEST_CASES.INDEX(input.projectId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw createApiError(error.code || 'SERVER_ERROR', error.message, response.status);
    }
    
    return response.json();
  }
});

export function useTestCaseVersions(projectId: string, testCaseId: string): QueryResult<Array<TestCase>> {
  return useQuery({
    queryKey: ['testCaseVersions', projectId, testCaseId],
    queryFn: () => apiClient.getTestCaseVersions(projectId, testCaseId),
    enabled: !!projectId && !!testCaseId,
  });
}

export function useRestoreTestCaseVersion(projectId: string, testCaseId: string): MutationResult<TestCase, number> {
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

export function useUpdateTestCase(projectId: string, testCaseId: string): MutationResult<TestCase, TestCaseFormData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestCaseFormData) => 
      apiClient.updateTestCase(projectId, testCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCase', projectId, testCaseId] });
    },
  });
}
