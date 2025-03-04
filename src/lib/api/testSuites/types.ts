import type { TestSuite, TestSuiteFormData } from '../../../types';

export interface TestSuitesApiClient {
  getTestSuites(projectId: string): Promise<TestSuite[]>;
  getTestSuite(projectId: string, suiteId: string): Promise<TestSuite>;
  createTestSuite(projectId: string, data: TestSuiteFormData): Promise<TestSuite>;
  updateTestSuite(projectId: string, suiteId: string, data: Partial<TestSuite>): Promise<TestSuite>;
} 