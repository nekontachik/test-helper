/**
 * Test Cases API Usage Examples
 */

import { useTestCases } from '@/hooks/useTestCases';
import { useTestCase } from '@/hooks/useTestCase';
import { TestCaseStatus, TestCasePriority } from '@/types/testCase';

// List test cases with filters
function TestCaseListExample() {
  const { testCases, isLoading, error } = useTestCases({
    projectId: 'project-123',
    initialFilters: {
      status: [TestCaseStatus.ACTIVE],
      priority: [TestCasePriority.HIGH],
      search: 'login',
      page: 1,
      limit: 10,
    },
  });
}

// Create a test case
function CreateTestCaseExample() {
  const projectId = 'project-123';
  const { createTestCase } = useTestCases({ projectId });

  const handleCreate = async () => {
    await createTestCase({
      projectId,
      title: 'Login Test',
      description: 'Test login functionality',
      priority: TestCasePriority.HIGH,
      status: TestCaseStatus.DRAFT,
      steps: [
        {
          order: 1,
          description: 'Enter credentials',
          expectedResult: 'Credentials accepted',
        },
      ],
    });
  };
}

// Update a test case
function UpdateTestCaseExample() {
  const { updateTestCase } = useTestCases({ projectId: 'project-123' });

  const handleUpdate = async () => {
    await updateTestCase('test-123', {
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.MEDIUM,
    });
  };
} 