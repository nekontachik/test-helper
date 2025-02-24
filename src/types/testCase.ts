export enum TestCaseStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED'
}

export enum TestCasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface TestCaseStep {
  order: number;
  description: string;
  expectedResult: string;
}

export interface TestCaseBase {
  title: string;
  description: string;
  priority: TestCasePriority;
  status: TestCaseStatus;
  steps?: TestCaseStep[];
  tags?: string[];
  projectId: string;
}

export interface TestCase extends TestCaseBase {
  id: string;
  createdAt: string;
  updatedAt: string;
} 