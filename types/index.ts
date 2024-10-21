export interface TestRun {
  runId: string;
  projectId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

// Add other types as needed
