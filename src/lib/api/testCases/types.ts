import type { TestCase, TestCaseFormData, TestCaseStatus, TestCasePriority, TestCaseVersion, PaginatedResponse } from '../../../types';

export interface TestCasesApiClient {
  getTestCases(
    projectId: string,
    params: {
      page: number;
      limit: number;
      status?: TestCaseStatus | null;
      priority?: TestCasePriority | null;
      search?: string;
    }
  ): Promise<PaginatedResponse<TestCase>>;
  getTestCase(projectId: string, testCaseId: string): Promise<TestCase>;
  createTestCase(projectId: string, data: TestCaseFormData): Promise<TestCase>;
  updateTestCase(projectId: string, testCaseId: string, data: Partial<TestCaseFormData>): Promise<TestCase>;
  deleteTestCase(projectId: string, testCaseId: string): Promise<void>;
  getTestCaseVersions(projectId: string, testCaseId: string): Promise<TestCaseVersion[]>;
  getTestCaseVersion(projectId: string, testCaseId: string, version: number): Promise<TestCase>;
  restoreTestCaseVersion(projectId: string, testCaseId: string, versionNumber: number): Promise<TestCase>;
} 