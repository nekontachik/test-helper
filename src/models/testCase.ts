export interface TestCase {
  id: string;
  title: string;
  description?: string;
  status: 'Pending' | 'Passed' | 'Failed' | 'Skipped';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseResult {
  id: string;
  testCaseId: string;
  status: string;
  notes?: string;
  // Add any other fields that are relevant to your TestCaseResult
}
