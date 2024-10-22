export interface Project {
  id: string;
  name: string;
  description: string;
  // Add any other properties your Project type might have
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
  createdAt: Date;
  updatedAt: Date;
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

export enum TestCaseStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DRAFT = 'Draft',
  PASSED = 'Passed',
  FAILED = 'Failed',
  SKIPPED = 'Skipped',
}

export enum TestCasePriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
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

export interface ProjectFormData {
  name: string;
  description: string;
  // Add any other fields that are part of the project creation form
}

// Add other types as needed
