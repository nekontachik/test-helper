import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import  apiClient  from '@/lib/apiClient';
import { TestCase, TestCaseFormData, TestCaseVersion } from '@/types';

export function useTestCase(projectId: string, testCaseId: string) {
  return useQuery(['testCase', projectId, testCaseId], () => 
    apiClient.getTestCase(projectId, testCaseId)
  );
}

export function useCreateTestCase(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestCaseFormData) => apiClient.createTestCase(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testCases', projectId]);
    },
  });
}

export function useUpdateTestCase(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testCaseId, data }: { testCaseId: string; data: Partial<TestCaseFormData> }) => 
      apiClient.updateTestCase(projectId, testCaseId, data),
    onSuccess: (updatedTestCase: TestCase) => {
      queryClient.invalidateQueries(['testCase', projectId, updatedTestCase.id]);
      queryClient.invalidateQueries(['testCases', projectId]);
    },
  });
}

export function useDeleteTestCase(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testCaseId: string) => apiClient.deleteTestCase(projectId, testCaseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['testCases', projectId]);
    },
  });
}

export function useTestCaseVersions(projectId: string, testCaseId: string) {
  return useQuery(['testCaseVersions', projectId, testCaseId], () => 
    apiClient.getTestCaseVersions(projectId, testCaseId)
  );
}

export function useRestoreTestCaseVersion(projectId: string, testCaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionNumber: number) => apiClient.restoreTestCaseVersion(projectId, testCaseId, versionNumber),
    onSuccess: (restoredTestCase: TestCase) => {
      queryClient.invalidateQueries(['testCase', projectId, testCaseId]);
      queryClient.invalidateQueries(['testCaseVersions', projectId, testCaseId]);
    },
  });
}
