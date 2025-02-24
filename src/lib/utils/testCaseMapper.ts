import type { TestCase, TestCaseStatus, TestCasePriority } from '@/types';
import type { TestCaseInput } from '@/lib/validators/testCaseValidator';

export interface TestCaseWithVersion {
  id: string;
  title: string;
  description: string;
  steps: string;
  expectedResult: string;
  actualResult: string;
  status: string;
  priority: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  currentVersion: number;
  version: number;
  userId?: string;
}

export const testCaseMapper = {
  toTestCase(testCase: TestCaseWithVersion): TestCase {
    return {
      id: testCase.id,
      title: testCase.title,
      description: testCase.description,
      steps: testCase.steps,
      expectedResult: testCase.expectedResult,
      actualResult: testCase.actualResult,
      status: testCase.status as TestCaseStatus,
      priority: testCase.priority as TestCasePriority,
      projectId: testCase.projectId,
      createdAt: new Date(testCase.createdAt),
      updatedAt: new Date(testCase.updatedAt),
      version: testCase.version
    };
  },

  toTestCaseWithVersion(
    testCase: TestCase, 
    version: number
  ): TestCaseWithVersion {
    return {
      ...testCase,
      currentVersion: version,
      version,
      createdAt: new Date(testCase.createdAt),
      updatedAt: new Date(testCase.updatedAt)
    };
  },

  fromTestCaseData(
    data: TestCaseInput,
    projectId: string,
    userId: string
  ): Omit<TestCaseWithVersion, 'id'> {
    return {
      ...data,
      description: data.description || '',
      projectId,
      userId,
      currentVersion: 1,
      version: 1,
      actualResult: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}; 