import type { TestCase } from '@/models/testCase';

export async function getTestCases(projectId: string): Promise<TestCase[]> {
  // TODO: Implement actual API call
  console.log(`Fetching test cases for project ${projectId}`);
  return []; // Return an empty array for now
}
