import { mockTestCases } from './mockData';
import { simulateApiDelay, logApiRequest } from './utils';
import type { ApiResponse, TestCase } from './types';

/**
 * Simulates fetching test cases for a specific test run
 * @param testRunId - Test run ID to fetch test cases for
 * @returns Promise with API response containing test cases or error
 */
export async function fetchTestCases(testRunId: string): Promise<ApiResponse<TestCase[]>> {
  logApiRequest(`Fetching test cases for test run ${testRunId}`);
  
  // Simulate API delay
  await simulateApiDelay(700);
  
  const testCases = mockTestCases[testRunId] || [];
  
  return {
    success: true,
    data: testCases
  };
}

/**
 * Simulates fetching a single test case by ID
 * @param testRunId - Test run ID the test case belongs to
 * @param testCaseId - Test case ID to fetch
 * @returns Promise with API response containing test case or error
 */
export async function fetchTestCase(testRunId: string, testCaseId: string): Promise<ApiResponse<TestCase>> {
  logApiRequest(`Fetching test case ${testCaseId} from test run ${testRunId}`);
  
  // Simulate API delay
  await simulateApiDelay(500);
  
  const testCases = mockTestCases[testRunId] || [];
  const testCase = testCases.find(tc => tc.id === testCaseId);
  
  if (!testCase) {
    return {
      success: false,
      error: 'Test case not found'
    };
  }
  
  return {
    success: true,
    data: testCase
  };
}

/**
 * Simulates creating a new test case
 * @param testRunId - Test run ID to add the test case to
 * @param testCaseData - Test case data to create
 * @returns Promise with API response containing created test case or error
 */
export async function createTestCase(testRunId: string, testCaseData: Partial<TestCase>): Promise<ApiResponse<TestCase>> {
  logApiRequest(`Creating new test case for test run ${testRunId}`, testCaseData);
  
  // Simulate API delay
  await simulateApiDelay(900);
  
  // In a real app, we would save the data to a database
  const newTestCase: TestCase = {
    id: `tc-${Date.now()}`,
    name: testCaseData.name || 'Untitled Test Case',
    description: testCaseData.description || '',
    status: testCaseData.status || 'pending',
    priority: testCaseData.priority || 'medium',
    executedBy: testCaseData.executedBy || null,
    executedAt: testCaseData.executedAt || null,
    projectId: testCaseData.projectId || '',
    testRunId: testRunId
  };
  
  // Initialize the test cases array for this test run if it doesn't exist
  if (!mockTestCases[testRunId]) {
    mockTestCases[testRunId] = [];
  }
  
  // In a real app, this would be a database operation
  mockTestCases[testRunId].push(newTestCase);
  
  return {
    success: true,
    data: newTestCase
  };
}

/**
 * Simulates updating a test case
 * @param testRunId - Test run ID the test case belongs to
 * @param testCaseId - Test case ID to update
 * @param testCaseData - Test case data to update
 * @returns Promise with API response containing updated test case or error
 */
export async function updateTestCase(
  testRunId: string, 
  testCaseId: string, 
  testCaseData: Partial<TestCase>
): Promise<ApiResponse<TestCase>> {
  logApiRequest(`Updating test case ${testCaseId} in test run ${testRunId}`, testCaseData);
  
  // Simulate API delay
  await simulateApiDelay(700);
  
  const testCases = mockTestCases[testRunId] || [];
  const testCaseIndex = testCases.findIndex(tc => tc.id === testCaseId);
  
  if (testCaseIndex === -1) {
    return {
      success: false,
      error: 'Test case not found'
    };
  }
  
  // We know existingTestCase exists because we checked testCaseIndex !== -1
  const existingTestCase = testCases[testCaseIndex]!;
  
  // In a real app, we would update the database
  const updatedTestCase: TestCase = {
    id: testCaseId,
    name: testCaseData.name || existingTestCase.name,
    status: testCaseData.status || existingTestCase.status,
    executedBy: testCaseData.executedBy !== undefined ? testCaseData.executedBy : existingTestCase.executedBy,
    executedAt: testCaseData.executedAt !== undefined ? testCaseData.executedAt : existingTestCase.executedAt,
    description: testCaseData.description || existingTestCase.description || '',
    priority: testCaseData.priority || existingTestCase.priority || 'medium',
    projectId: testCaseData.projectId || existingTestCase.projectId || '',
    testRunId: testRunId
  };
  
  // Update the test case in the mock data
  testCases[testCaseIndex] = updatedTestCase;
  
  return {
    success: true,
    data: updatedTestCase
  };
}

/**
 * Simulates deleting a test case
 * @param testRunId - Test run ID the test case belongs to
 * @param testCaseId - Test case ID to delete
 * @returns Promise with API response indicating success or error
 */
export async function deleteTestCase(testRunId: string, testCaseId: string): Promise<ApiResponse<void>> {
  logApiRequest(`Deleting test case ${testCaseId} from test run ${testRunId}`);
  
  // Simulate API delay
  await simulateApiDelay(600);
  
  const testCases = mockTestCases[testRunId] || [];
  const testCaseIndex = testCases.findIndex(tc => tc.id === testCaseId);
  
  if (testCaseIndex === -1) {
    return {
      success: false,
      error: 'Test case not found'
    };
  }
  
  // In a real app, we would delete from the database
  testCases.splice(testCaseIndex, 1);
  
  return {
    success: true
  };
} 