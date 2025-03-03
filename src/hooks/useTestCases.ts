import { useCallback } from 'react';
import { useApiState } from './useApiState';
import type { TestCase, TestCaseFormData, PaginatedResponse, TestCaseStatus, TestCasePriority } from '@/types';

interface UseTestCasesOptions {
  projectId: string;
  initialData?: PaginatedResponse<TestCase>;
}

interface TestCaseFilters {
  status?: TestCaseStatus;
  priority?: TestCasePriority;
  search?: string;
  page?: number;
  limit?: number;
}

interface UseTestCasesReturn {
  testCases: PaginatedResponse<TestCase> | undefined;
  loading: boolean;
  error: Error | null;
  fetchTestCases: (filters?: TestCaseFilters) => Promise<PaginatedResponse<TestCase>>;
  createTestCase: (data: TestCaseFormData) => Promise<TestCase>;
  updateTestCase: (testCaseId: string, data: Partial<TestCaseFormData>) => Promise<TestCase | undefined>;
  deleteTestCase: (testCaseId: string) => Promise<void | undefined>;
  restoreTestCaseVersion: (testCaseId: string, versionNumber: number) => Promise<TestCase>;
  invalidateCache: (key?: string) => void;
  setTestCases: (data: PaginatedResponse<TestCase> | undefined) => void;
}

export function useTestCases({ projectId, initialData }: UseTestCasesOptions): UseTestCasesReturn {
  const {
    data: testCases,
    loading,
    error,
    request,
    invalidateCache,
    setData
  } = useApiState<PaginatedResponse<TestCase>>({
    initialData,
    cacheKey: `test-cases:${projectId}`,
    optimisticUpdate: true
  });

  const fetchTestCases = useCallback(async (filters: TestCaseFilters = {}) => {
    return request<PaginatedResponse<TestCase>>(
      'GET',
      `/projects/${projectId}/test-cases`,
      filters
    );
  }, [projectId, request]);

  const createTestCase = useCallback(async (data: TestCaseFormData) => {
    // Optimistic update
    const optimisticTestCase: TestCase = {
      id: `temp-${Date.now()}`,
      projectId,
      title: data.title,
      description: data.description,
      steps: data.steps,
      expectedResult: data.expectedResult,
      priority: data.priority,
      status: 'DRAFT' as TestCaseStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    if (testCases?.items) {
      const optimisticData = {
        ...testCases,
        items: [optimisticTestCase, ...testCases.items],
        total: testCases.total + 1
      };

      return request<TestCase>(
        'POST',
        `/projects/${projectId}/test-cases`,
        data,
        optimisticData
      );
    }

    return request<TestCase>('POST', `/projects/${projectId}/test-cases`, data);
  }, [projectId, request, testCases]);

  const updateTestCase = useCallback(async (testCaseId: string, data: Partial<TestCaseFormData>) => {
    if (!testCases?.items) return;

    // Find the test case to update
    const testCaseIndex = testCases.items.findIndex((tc: TestCase) => tc.id === testCaseId);
    if (testCaseIndex === -1) return;

    // Create optimistic update
    const updatedTestCase = {
      ...testCases.items[testCaseIndex],
      ...data,
      updatedAt: new Date()
    };

    const optimisticData = {
      ...testCases,
      items: [
        ...testCases.items.slice(0, testCaseIndex),
        updatedTestCase,
        ...testCases.items.slice(testCaseIndex + 1)
      ]
    };

    return request<TestCase>(
      'PUT',
      `/projects/${projectId}/test-cases/${testCaseId}`,
      data,
      optimisticData
    );
  }, [projectId, request, testCases]);

  const deleteTestCase = useCallback(async (testCaseId: string) => {
    if (!testCases?.items) return;

    // Optimistic update - remove from list
    const optimisticData = {
      ...testCases,
      items: testCases.items.filter((tc: TestCase) => tc.id !== testCaseId),
      total: testCases.total - 1
    };

    return request<void>(
      'DELETE',
      `/projects/${projectId}/test-cases/${testCaseId}`,
      undefined,
      optimisticData
    );
  }, [projectId, request, testCases]);

  const restoreTestCaseVersion = useCallback(async (testCaseId: string, versionNumber: number) => {
    return request<TestCase>(
      'POST',
      `/projects/${projectId}/test-cases/${testCaseId}/restore`,
      { versionNumber }
    );
  }, [projectId, request]);

  return {
    testCases,
    loading,
    error,
    fetchTestCases,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    restoreTestCaseVersion,
    invalidateCache,
    setTestCases: setData
  };
}
