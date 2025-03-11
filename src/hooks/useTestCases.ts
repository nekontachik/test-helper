import { useCallback } from 'react';
import { useApiState } from './useApiState';
import type { TestCase, TestCaseFormData, TestCaseStatus, TestCasePriority } from '@/types';
import type { PaginatedResponse } from '@/types/api';

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

// Helper type guard to check if PaginatedResponse has items
function hasPaginatedItems<T>(obj: unknown): obj is PaginatedResponse<T> {
  return obj !== null && 
         typeof obj === 'object' && 
         'items' in obj && 
         Array.isArray((obj as Record<string, unknown>).items);
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
      actualResult: '',
      priority: data.priority,
      status: 'DRAFT' as TestCaseStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    if (testCases && hasPaginatedItems<TestCase>(testCases)) {
      const optimisticData: PaginatedResponse<TestCase> = {
        ...testCases,
        items: [optimisticTestCase, ...testCases.items],
        totalItems: testCases.totalItems + 1,
        currentPage: testCases.currentPage,
        totalPages: testCases.totalPages
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
    if (!testCases || !hasPaginatedItems<TestCase>(testCases)) return;
    
    if (testCases.items.length === 0) return;

    // Find the test case to update
    const testCaseIndex = testCases.items.findIndex((tc: TestCase) => tc.id === testCaseId);
    if (testCaseIndex === -1) return;

    // Get the original test case - we know it exists because we checked the index above
    const originalTestCase = testCases.items[testCaseIndex];
    
    // Since we've checked that testCaseIndex is valid, originalTestCase must exist
    if (!originalTestCase) {
      // This should never happen, but TypeScript needs this check
      return;
    }
    
    // Create optimistic update with explicit properties to ensure type safety
    const updatedTestCase: TestCase = {
      id: originalTestCase.id,
      projectId: originalTestCase.projectId,
      title: data.title || originalTestCase.title,
      description: data.description || originalTestCase.description,
      steps: data.steps || originalTestCase.steps,
      expectedResult: data.expectedResult || originalTestCase.expectedResult,
      actualResult: originalTestCase.actualResult || '',
      priority: data.priority || originalTestCase.priority,
      status: originalTestCase.status,
      createdAt: originalTestCase.createdAt,
      updatedAt: new Date(),
      version: originalTestCase.version
    };

    const optimisticData: PaginatedResponse<TestCase> = {
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
    if (!testCases || !hasPaginatedItems<TestCase>(testCases)) return;
    
    // Optimistic update - remove from list
    const optimisticData: PaginatedResponse<TestCase> = {
      ...testCases,
      items: testCases.items.filter((tc: TestCase) => tc.id !== testCaseId),
      totalItems: testCases.totalItems - 1
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
