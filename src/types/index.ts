export enum TestRunStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TestCaseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  SKIPPED = 'SKIPPED',
}

export enum TestCasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TestCaseResultStatus {
  PENDING = 'PENDING',
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
  description: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string;
  expectedResult: string;
  actualResult: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  projectId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
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
  testCases: TestCase[];
  testCaseResults: TestCaseResult[];
  completedAt?: Date;
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
  notes?: string;
  testCase: TestCase;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestReport {
  id: string;
  name: string;
  description: string;
  projectId: string;
  testRunId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  steps: string;
  expectedResult: string;
  actualResult: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  projectId: string;
}

export interface TestRunFormData {
  name: string;
  testCaseIds: string[];
  projectId: string;
  status: TestRunStatus;
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
  totalPages: number;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface TestReportFormData {
  name: string;
  description: string;
  testRunId: string;
  projectId: string;
}

export type TestSuiteUpdateData = Pick<TestSuite, 'name' | 'description'>;

export interface TestCaseAttachment {
  id: string;
  testCaseId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestRunNote {
  id: string;
  testRunId: string;
  content: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseAttachmentFormData {
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export interface TestRunNoteFormData {
  content: string;
}
