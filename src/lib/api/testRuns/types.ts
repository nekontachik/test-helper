import type { TestRun, TestRunFormData, PaginatedResponse } from '../../../types';

export interface TestRunsApiClient {
  getTestRuns(projectId: string, params: { page: number; limit: number; sort?: string; filter?: string }): Promise<PaginatedResponse<TestRun>>;
  getTestRun(projectId: string, runId: string): Promise<TestRun>;
  createTestRun(projectId: string, data: TestRunFormData): Promise<TestRun>;
  updateTestRun(projectId: string, runId: string, data: { status: string; testCaseResults: unknown[] }): Promise<void>;
  deleteTestRun(projectId: string, runId: string): Promise<void>;
  bulkDeleteTestRuns(projectId: string, runIds: string[]): Promise<void>;
} 