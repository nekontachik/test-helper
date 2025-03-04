import type { TestReport, TestReportFormData } from '../../../types';

export interface TestReportsApiClient {
  getTestReports(projectId: string): Promise<TestReport[]>;
  createTestReport(projectId: string, data: TestReportFormData): Promise<TestReport>;
} 