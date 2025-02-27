/**
 * Test Cases API Usage Examples
 * 
 * This file contains example code snippets for documentation purposes.
 * These are not actual functional components but examples of how to use the API.
 */

/**
 * Example of how to use the useTestCases hook
 */
export const testCaseListExample = `
// Import the hook
import { useTestCases } from '@/hooks/useTestCases';
import { TestCaseStatus, TestCasePriority } from '@/types/testCase';

// Inside your component
function TestCaseList() {
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
  
  // Render your component using the data
}
`;

/**
 * Example of how to create a test case
 */
export const createTestCaseExample = `
// Import the hook
import { useTestCases } from '@/hooks/useTestCases';
import { TestCaseStatus, TestCasePriority } from '@/types/testCase';

// Inside your component
function CreateTestCase() {
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
  
  // Render your component with a form that calls handleCreate
}
`;

/**
 * Example of how to update a test case
 */
export const updateTestCaseExample = `
// Import the hook
import { useTestCases } from '@/hooks/useTestCases';
import { TestCaseStatus, TestCasePriority } from '@/types/testCase';

// Inside your component
function UpdateTestCase() {
  const { updateTestCase } = useTestCases({ projectId: 'project-123' });

  const handleUpdate = async () => {
    await updateTestCase('test-123', {
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.MEDIUM,
    });
  };
  
  // Render your component with a form that calls handleUpdate
}
`; 