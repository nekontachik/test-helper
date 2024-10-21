export enum TestRunStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TestCaseStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

export enum TestCasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  testCases?: TestCase[];
  testRuns?: TestRun[];
  testReports?: TestReport[];
}

export interface TestCase {
  id: string;
  title: string;
  steps: string;
  expectedResult: string;
  actualResult: string;
  priority: TestCasePriority;
  status: TestCaseStatus;
  description?: string;
  projectId: string;
  testSuiteId?: string;
  createdAt: Date;
  updatedAt: Date;
  testRunCases?: TestCase[];
  testCaseResults?: TestCaseResult[];
  version: number;
}

export interface TestCaseVersion {
  id: string;
  testCaseId: string;
  versionNumber: number;
  title: string;
  description: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  expectedResult: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestRun {
  id: string;
  name: string;
  status: TestRunStatus;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  // Add any other properties that your TestRun type should have
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  // Add any other relevant fields
}

export interface TestCaseResult {
  id: string;
  status: TestCaseResultStatus;
  notes?: string;
  testCaseId: string;
  testRunId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TestCaseResultStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface TestReport {
  id: string;
  name: string;
  createdAt: string;
  // Add other relevant fields
}

// Form data types
export type TestCaseFormData = Omit<
  TestCase,
  'id' | 'project' | 'testSuite' | 'testRuns' | 'createdAt' | 'updatedAt'
>;

export type TestRunFormData = Omit<
  TestRun,
  'id' | 'project' | 'testCases' | 'testCaseResults' | 'createdAt' | 'updatedAt'
> & {
  testCaseIds: string[];
};

export type TestSuiteFormData = Omit<
  TestSuite,
  'id' | 'project' | 'testCases' | 'createdAt' | 'updatedAt'
>;

export type TestCaseResultFormData = Omit<
  TestCaseResult,
  'id' | 'testCase' | 'testRun' | 'createdAt' | 'updatedAt'
>;

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectFormData {
  name: string;
  description?: string;
}
