import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { TestCase, TestCaseVersion } from '@/types';

export function useTestCase(projectId: string, testCaseId: string) {
  return useQuery(['testCase', projectId, testCaseId], () =>
    apiClient.getTestCase(projectId, testCaseId)
  );
}

export function useTestCaseVersions(projectId: string, testCaseId: string) {
  return useQuery(['testCaseVersions', projectId, testCaseId], () =>
    apiClient.getTestCaseVersions(projectId, testCaseId)
  );
}

export function useRestoreTestCaseVersion(projectId: string, testCaseId: string) {
  const queryClient = useQueryClient();

  return useMutation(
    (versionNumber: number) => apiClient.restoreTestCaseVersion(projectId, testCaseId, versionNumber),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['testCase', projectId, testCaseId]);
        queryClient.invalidateQueries(['testCaseVersions', projectId, testCaseId]);
      },
    }
  );
}
