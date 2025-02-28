export interface TestCase {
  id: string;
  name: string;
  description?: string;
  status: 'passed' | 'failed' | 'pending' | 'blocked' | 'skipped';
  executedBy: string | null;
  executedAt: string | null;
  priority?: 'high' | 'medium' | 'low';
  projectId?: string;
  testRunId?: string;
}

export interface TestRunStats {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  blocked: number;
  skipped?: number;
}

export interface TestRun {
  id: string;
  name: string;
  description: string;
  status: 'in_progress' | 'completed' | 'cancelled' | 'draft';
  progress: number;
  projectName: string;
  projectId: string;
  startDate: string;
  estimatedEndDate: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  environment: string;
  testCases: TestRunStats;
  testCaseList?: TestCase[];
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  testCaseCount: number;
  testRunCount: number;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tester' | 'viewer';
  avatar?: string;
} 