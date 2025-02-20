import { createTypedQueryHook } from '@/lib/hooks/createQueryHook';
import { testCaseService } from '@/services/TestCaseService';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';
import { createMutation } from '@/lib/hooks/createMutationHook';
import { queryClient } from '@/lib/queryClient';

interface TestCaseQueryParams {
  projectId: string;
  status?: TestCaseStatus[];
  priority?: TestCasePriority[];
  search?: string;
  assignedTo?: string[];
  tags?: string[];
  page?: number;
  limit?: number;
}

export const useTestCases = createTypedQueryHook<TestCase, TestCaseQueryParams>({
  queryKey: (params) => ['testCases', params.projectId],
  queryFn: (params, queryOptions) => 
    testCaseService.findWithComplexFilters({
      ...params,
      ...queryOptions
    }),
  defaultOptions: {
    orderBy: { updatedAt: 'desc' },
    include: {
      project: { select: { id: true, name: true } },
      assignees: { select: { user: { select: { id: true, name: true } } } },
      tags: true
    }
  },
  enabled: (params) => Boolean(params.projectId)
});

export const useDeleteTestCase = createMutation({
  mutationFn: (id: string) => testCaseService.delete(id),
  successMessage: 'Test case deleted successfully',
  errorMessage: 'Failed to delete test case',
  onSuccess: () => {
    queryClient.invalidateQueries(['testCases']);
  }
});
