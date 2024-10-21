export interface PaginationParams {
  page: number;
  limit: number;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  expectedResult: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  testSuiteId: string | null;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  expectedResult: string;
  status: string;
  priority: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestRunFormData {
  name: string;
  testCaseIds: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface TestRun {
  id: string;
  name: string;
  status: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  // Define the necessary fields here
  name: string;
  description?: string;
  // Add other relevant properties
}
