import type { TestCase } from './testCase';
import type { Project } from './project';

export interface TestCaseResult {
  id: string;
  testCaseId: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ApiTestRun {
  id: string;
  name: string;
  status: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  testSuiteId: string | null;
  testCases?: TestCase[];
  testCaseResults?: TestCaseResult[];
}

export interface TestRun {
  id: string;
  name: string;
  status: string;
  projectId: string;
  project?: Project; // Make this optional
  testCases?: TestCase[];
  testCaseResults?: TestCaseResult[];
  testSuiteId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiTestCaseResult {
  id: string;
  testCaseId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InternalTestCaseResult {
  id: string;
  testCaseId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestRunFormData {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  testCases: { testCaseId: string; status: string; notes: string }[];
  testSuiteId?: string;
}
