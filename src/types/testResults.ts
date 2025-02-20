import type { TestCaseResultStatus } from '@/types';

export interface TestResult {
  testCaseId: string;
  status: TestCaseResultStatus;
  notes?: string;
  evidenceUrls?: string[];
}

export interface TestResultWithEvidence extends TestResult {
  evidence?: File[];
} 