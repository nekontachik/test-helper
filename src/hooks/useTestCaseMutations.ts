import { createMutation } from '@/lib/hooks/createMutationHook';
import { testCaseService } from '@/services/TestCaseService';
import { TestCase, TestCaseInput } from '@/types';
import { queryClient } from '@/lib/queryClient';

export const useCreateTestCase = createMutation({
  mutationFn: (data: TestCaseInput) => testCaseService.createWithValidation(data),
  successMessage: 'Test case created successfully',
  errorMessage: 'Failed to create test case',
  onSuccess: () => {
    queryClient.invalidateQueries(['testCases']);
  }
});

export const useUpdateTestCase = createMutation({
  mutationFn: ({ id, data }: { id: string; data: Partial<TestCaseInput> }) => 
    testCaseService.updateWithValidation(id, data),
  successMessage: 'Test case updated successfully',
  errorMessage: 'Failed to update test case',
  onSuccess: () => {
    queryClient.invalidateQueries(['testCases']);
  }
});

export const useDeleteTestCase = createMutation({
  mutationFn: (id: string) => testCaseService.delete(id),
  successMessage: 'Test case deleted successfully',
  errorMessage: 'Failed to delete test case',
  onSuccess: () => {
    queryClient.invalidateQueries(['testCases']);
  }
}); 