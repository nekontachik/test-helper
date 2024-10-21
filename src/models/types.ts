export enum TestCaseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export enum TestCasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TestCaseResultStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  expectedResult: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  testSuiteId: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectResponse {
  success: boolean;
  data?: Project | Project[];
  error?: string;
}

export interface TestRun {
  id: string;
  name: string;
  status: TestRunStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  testCases?: TestCase[];
  testCaseResults?: TestCaseResult[];
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  testCases?: TestCase[];
}

export interface TestCaseResult {
  id: string;
  status: TestCaseResultStatus;
  notes?: string;
  testCaseId: string;
  testRunId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  expectedResult: string;
  status: TestCaseStatus;
  priority: TestCasePriority; // Ensure this matches the enum type
}

export interface TestRunFormData {
  name: string;
  testCaseIds: string[];
  testSuiteId?: string; // Optional field
}

export interface TestSuiteFormData {
  name: string;
  description: string;
  testCaseIds: string[];
}

export enum TestRunStatus {
  PLANNED = 'PLANNED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface TestRun {
  id: string;
  name: string;
  status: TestRunStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  testCases?: TestCase[];
  testCaseResults?: TestCaseResult[];
}
