import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { TestCase, TestCaseFormData } from '@/types';

export function useTestCase(projectId: string, testCaseId: string) {
  return useQuery({
    queryKey: ['testCase', projectId, testCaseId],
    queryFn: () => apiClient.getTestCase(projectId, testCaseId),
    enabled: !!projectId && !!testCaseId,
  });
}

export function useCreateTestCase(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestCaseFormData) => apiClient.createTestCase(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases', projectId] });
    },
  });
}

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
