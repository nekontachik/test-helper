export enum TestRunStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TestCaseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  SKIPPED = 'SKIPPED', // Add this line if you need a SKIPPED status
}

export enum TestCasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
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

export enum TestCaseResultStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  // ... other properties
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  expectedResult: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  projectId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  // ... other properties
}

export interface TestRun {
  id: string;
  name: string;
  status: string;
  projectId: string;
  testCases?: TestCase[];
  testCaseResults?: TestCaseResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  testCases?: string[]; // Array of test case IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseResult {
  id: string;
  testCaseId: string;
  testRunId: string;
  status: TestCaseResultStatus;
  createdAt: Date;
  updatedAt: Date;
  testCase?: TestCase;
}

export interface TestReport {
  id: string;
  name: string;
  description: string; // Add this line
  projectId: string;
  testRunId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  expectedResult: string;
  projectId: string;
}

export interface TestRunFormData {
  name: string;
  testCaseIds: string[];
  projectId: string;
  status: string;
}

export type TestSuiteFormData = Omit<
  TestSuite,
  'id' | 'project' | 'testCases' | 'createdAt' | 'updatedAt'
>;

export type TestCaseResultFormData = Omit<
  TestCaseResult,
  'id' | 'testCase' | 'testRun' | 'createdAt' | 'updatedAt'
>;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number; // Add this line
}

export interface ProjectFormData {
  name: string;
  description?: string;
  // Add other relevant fields
}

export interface TestReportFormData {
  name: string;
  description: string;
  testRunId: string;
  projectId: string;
}

// ... other type definitions

export type TestSuiteUpdateData = Pick<TestSuite, 'name' | 'description'>;






