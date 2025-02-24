import { createMutation } from '@/lib/hooks/createMutationHook';
import { QueryClient } from '@tanstack/react-query';
import type { TestCase } from '@/types/testCase';

// Create a singleton QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

type CreateTestCaseData = Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>;

export const useCreateTestCase = createMutation<TestCase, CreateTestCaseData>({
  mutationFn: async (data: CreateTestCaseData) => {
    const response = await fetch(`/api/projects/${data.projectId}/test-cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create test case');
    return response.json();
  },
  successMessage: 'Test case created successfully',
  errorMessage: 'Failed to create test case',
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['testCases'] });
  }
});

interface UpdateTestCaseVariables {
  id: string;
  data: Partial<TestCase>;
}

export const useUpdateTestCase = createMutation<TestCase, UpdateTestCaseVariables>({
  mutationFn: async ({ id, data }: UpdateTestCaseVariables) => {
    const response = await fetch(`/api/test-cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update test case');
    return response.json();
  },
  successMessage: 'Test case updated successfully',
  errorMessage: 'Failed to update test case',
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['testCases'] });
  }
});

export const useDeleteTestCase = createMutation<void, string>({
  mutationFn: async (id: string) => {
    const response = await fetch(`/api/test-cases/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete test case');
  },
  successMessage: 'Test case deleted successfully',
  errorMessage: 'Failed to delete test case',
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['testCases'] });
  }
}); 