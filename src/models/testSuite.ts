import { TestCase } from './testCase';

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  testCaseIds: string[];
  testCases?: TestCase[];
}
