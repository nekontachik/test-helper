export enum TestRunStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped'
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
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
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

export interface TestRun {
  id: string;
  name: string;
  description?: string;
  status: TestRunStatus;
  projectId: string;
  testCases: TestCase[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
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

export interface TestResult {
  id: string;
  testCaseId: string;
  status: TestCaseResultStatus;
  notes?: string;
  evidence?: string[];
  startedAt?: Date;
  completedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseResult extends Omit<TestResult, 'evidence'> {
  id: string;
  testCase: TestCase;
  createdAt: string;
  updatedAt: string;
}

export interface TestReportStatistics {
  totalTests: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  passRate: number;
}

export interface TestReportResult {
  testCaseId: string;
  status: TestCaseResultStatus;
  notes?: string;
  executedBy: string;
  executedAt: string;
}

export interface TestReport {
  id: string;
  projectId: string;
  runId: string;
  statistics: TestReportStatistics;
  results: TestReportResult[];
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  testRun: {
    testCases: TestCase[];
  };
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
  runId: string;
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
  runId: string;
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

export interface TestRunInput {
  name: string;
  description?: string;
  projectId: string;
  testCases?: string[];
  status?: TestRunStatus;
}

export interface TestRunProgress {
  projectId: string;
  testRunId: string;
  currentIndex: number;
  results: TestResult[];
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface TestFormData {
  status: TestCaseResultStatus;
  notes?: string;
  evidenceUrls: string[];
}

export * from './operations';

export interface TestCase {
  id: string;
  title: string;
  description?: string;
  steps: string[];
  expectedResult: string;
  priority: TestCasePriority;
  status: TestCaseStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseFilters {
  title?: string;
  status?: string;
  priority?: string;
}
