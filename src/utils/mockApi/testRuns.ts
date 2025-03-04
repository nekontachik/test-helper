import { mockTestRuns, mockTestCases } from './mockData';
import { simulateApiDelay, logApiRequest } from './utils';
import type { ApiResponse, TestRun } from './types';

/**
 * Simulates fetching test runs from an API
 * @returns Promise with API response containing test runs or error
 */
export async function fetchTestRuns(): Promise<ApiResponse<TestRun[]>> {
  logApiRequest('Fetching test runs');
  
  // Simulate API delay
  await simulateApiDelay(800);
  
  return {
    success: true,
    data: mockTestRuns
  };
}

/**
 * Simulates fetching test runs for a specific project
 * @param projectId - Project ID to fetch test runs for
 * @returns Promise with API response containing test runs or error
 */
export async function fetchProjectTestRuns(projectId: string): Promise<ApiResponse<TestRun[]>> {
  logApiRequest(`Fetching test runs for project ${projectId}`);
  
  // Simulate API delay
  await simulateApiDelay(600);
  
  const filteredRuns = mockTestRuns.filter(run => run.projectId === projectId);
  
  return {
    success: true,
    data: filteredRuns
  };
}

/**
 * Simulates fetching a single test run by ID
 * @param id - Test run ID to fetch
 * @returns Promise with API response containing test run or error
 */
export async function fetchTestRun(id: string): Promise<ApiResponse<TestRun>> {
  logApiRequest(`Fetching test run with ID ${id}`);
  
  // Simulate API delay
  await simulateApiDelay(500);
  
  const testRun = mockTestRuns.find(run => run.id === id);
  
  if (!testRun) {
    return {
      success: false,
      error: 'Test run not found'
    };
  }
  
  // Add test cases to the response if available
  const testRunWithCases = {
    ...testRun,
    testCaseList: mockTestCases[id] || []
  };
  
  return {
    success: true,
    data: testRunWithCases as TestRun
  };
}

/**
 * Simulates creating a new test run
 * @param testRunData - Test run data to create
 * @returns Promise with API response containing created test run or error
 */
export async function createTestRun(testRunData: Partial<TestRun>): Promise<ApiResponse<TestRun>> {
  logApiRequest('Creating new test run', testRunData);
  
  // Simulate API delay
  await simulateApiDelay(1000);
  
  // In a real app, we would save the data to a database
  const newTestRun: TestRun = {
    id: `tr-${Date.now()}`,
    name: testRunData.name || 'Untitled Test Run',
    description: testRunData.description || '',
    status: testRunData.status || 'draft',
    progress: testRunData.progress || 0,
    projectId: testRunData.projectId || '',
    projectName: testRunData.projectName || '',
    startDate: testRunData.startDate || new Date().toISOString(),
    estimatedEndDate: testRunData.estimatedEndDate || '',
    createdBy: testRunData.createdBy || 'Anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    environment: testRunData.environment || 'Development',
    testCases: testRunData.testCases || {
      total: 0,
      passed: 0,
      failed: 0,
      pending: 0,
      blocked: 0
    }
  };
  
  return {
    success: true,
    data: newTestRun
  };
}

/**
 * Simulates updating a test run
 * @param id - Test run ID to update
 * @param testRunData - Test run data to update
 * @returns Promise with API response containing updated test run or error
 */
export async function updateTestRun(id: string, testRunData: Partial<TestRun>): Promise<ApiResponse<TestRun>> {
  logApiRequest(`Updating test run with ID ${id}`, testRunData);
  
  // Simulate API delay
  await simulateApiDelay(800);
  
  const testRun = mockTestRuns.find(run => run.id === id);
  
  if (!testRun) {
    return {
      success: false,
      error: 'Test run not found'
    };
  }
  
  // In a real app, we would update the database
  const updatedTestRun: TestRun = {
    ...testRun,
    ...testRunData,
    id: testRun.id, // Ensure ID is preserved
    updatedAt: new Date().toISOString()
  };
  
  return {
    success: true,
    data: updatedTestRun
  };
} 