import type { Project, TestRun, TestCase } from '@/types/testRuns';
import { logger } from '@/lib/logger';

// Mock projects data
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'E-commerce Platform Testing',
    description: 'Quality assurance for our main e-commerce platform',
    status: 'active',
    testCaseCount: 128,
    testRunCount: 12,
    createdAt: '2023-01-15',
    updatedAt: '2023-08-05',
    lastActivity: '2023-08-10'
  },
  {
    id: 'proj-2',
    name: 'Mobile App Testing',
    description: 'Testing suite for iOS and Android mobile applications',
    status: 'active',
    testCaseCount: 87,
    testRunCount: 8,
    createdAt: '2023-02-20',
    updatedAt: '2023-07-30',
    lastActivity: '2023-08-02'
  },
  {
    id: 'proj-3',
    name: 'API Integration Testing',
    description: 'Tests for various API integrations with third-party services',
    status: 'active',
    testCaseCount: 56,
    testRunCount: 5,
    createdAt: '2023-03-10',
    updatedAt: '2023-07-25',
    lastActivity: '2023-07-28'
  },
  {
    id: 'proj-4',
    name: 'Admin Dashboard',
    description: 'Testing for the internal admin dashboard',
    status: 'completed',
    testCaseCount: 42,
    testRunCount: 6,
    createdAt: '2023-04-05',
    updatedAt: '2023-06-30',
    lastActivity: '2023-06-30'
  }
];

// Mock test runs data
const mockTestRuns: TestRun[] = [
  {
    id: 'tr-1',
    name: 'Sprint 27 Regression',
    description: 'Complete regression suite for sprint 27 release',
    status: 'in_progress',
    progress: 65,
    projectName: 'E-commerce Platform Testing',
    projectId: 'proj-1',
    startDate: '2023-08-10',
    estimatedEndDate: '2023-08-17',
    createdBy: 'John Doe',
    createdAt: '2023-08-09',
    updatedAt: '2023-08-13',
    environment: 'Staging',
    testCases: {
      total: 48,
      passed: 28,
      failed: 3,
      pending: 17,
      blocked: 0
    }
  },
  {
    id: 'tr-2',
    name: 'Payment Gateway Integration',
    description: 'Test cases for new payment provider integration',
    status: 'in_progress',
    progress: 32,
    projectName: 'E-commerce Platform Testing',
    projectId: 'proj-1',
    startDate: '2023-08-11',
    estimatedEndDate: '2023-08-18',
    createdBy: 'Alex Johnson',
    createdAt: '2023-08-10',
    updatedAt: '2023-08-12',
    environment: 'Development',
    testCases: {
      total: 25,
      passed: 8,
      failed: 0,
      pending: 17,
      blocked: 0
    }
  },
  {
    id: 'tr-3',
    name: 'Sprint 26 Regression',
    description: 'Complete regression suite for sprint 26 release',
    status: 'completed',
    progress: 100,
    projectName: 'E-commerce Platform Testing',
    projectId: 'proj-1',
    startDate: '2023-08-01',
    estimatedEndDate: '2023-08-07',
    createdBy: 'John Doe',
    createdAt: '2023-07-31',
    updatedAt: '2023-08-07',
    environment: 'Staging',
    testCases: {
      total: 42,
      passed: 40,
      failed: 2,
      pending: 0,
      blocked: 0
    }
  },
  {
    id: 'tr-4',
    name: 'User Authentication Flow',
    description: 'Tests for user authentication including login, registration, and password reset',
    status: 'completed',
    progress: 100,
    projectName: 'Mobile App Testing',
    projectId: 'proj-2',
    startDate: '2023-07-29',
    estimatedEndDate: '2023-08-02',
    createdBy: 'Maria Garcia',
    createdAt: '2023-07-28',
    updatedAt: '2023-08-02',
    environment: 'Production',
    testCases: {
      total: 18,
      passed: 16,
      failed: 2,
      pending: 0,
      blocked: 0
    }
  }
];

// Mock test cases for test run details
const mockTestCases: Record<string, TestCase[]> = {
  'tr-1': [
    { id: 'tc-1', name: 'User login with valid credentials', status: 'passed', executedBy: 'Alice Cooper', executedAt: '2023-08-12' },
    { id: 'tc-2', name: 'User login with invalid credentials', status: 'passed', executedBy: 'Alice Cooper', executedAt: '2023-08-12' },
    { id: 'tc-3', name: 'User password reset flow', status: 'passed', executedBy: 'Alice Cooper', executedAt: '2023-08-13' },
    { id: 'tc-4', name: 'Product search functionality', status: 'failed', executedBy: 'Bob Smith', executedAt: '2023-08-13' },
    { id: 'tc-5', name: 'Add product to cart', status: 'passed', executedBy: 'Bob Smith', executedAt: '2023-08-13' },
    { id: 'tc-6', name: 'Checkout process - guest user', status: 'pending', executedBy: null, executedAt: null },
    { id: 'tc-7', name: 'Checkout process - registered user', status: 'pending', executedBy: null, executedAt: null },
    { id: 'tc-8', name: 'Payment processing - credit card', status: 'pending', executedBy: null, executedAt: null },
  ]
};

/**
 * Simulates fetching projects from an API
 */
export async function fetchProjects(): Promise<{
  success: boolean;
  data?: Project[];
  error?: string;
}> {
  logger.debug('Fetching projects from mock API');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    data: mockProjects
  };
}

/**
 * Simulates fetching a single project by ID
 */
export async function fetchProject(id: string): Promise<{
  success: boolean;
  data?: Project;
  error?: string;
}> {
  logger.debug(`Fetching project with ID ${id} from mock API`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const project = mockProjects.find(p => p.id === id);
  
  if (!project) {
    return {
      success: false,
      error: 'Project not found'
    };
  }
  
  return {
    success: true,
    data: project
  };
}

/**
 * Simulates fetching test runs from an API
 */
export async function fetchTestRuns(): Promise<{
  success: boolean;
  data?: TestRun[];
  error?: string;
}> {
  logger.debug('Fetching test runs from mock API');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    data: mockTestRuns
  };
}

/**
 * Simulates fetching test runs for a specific project
 */
export async function fetchProjectTestRuns(projectId: string): Promise<{
  success: boolean;
  data?: TestRun[];
  error?: string;
}> {
  logger.debug(`Fetching test runs for project ${projectId} from mock API`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const filteredRuns = mockTestRuns.filter(run => run.projectId === projectId);
  
  return {
    success: true,
    data: filteredRuns
  };
}

/**
 * Simulates fetching a single test run by ID
 */
export async function fetchTestRun(id: string): Promise<{
  success: boolean;
  data?: TestRun;
  error?: string;
}> {
  logger.debug(`Fetching test run with ID ${id} from mock API`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const testRun = mockTestRuns.find(run => run.id === id);
  
  if (!testRun) {
    return {
      success: false,
      error: 'Test run not found'
    };
  }
  
  // Add test cases to the response if available
  const testRunWithCases = {
    ...testRun,
    testCaseList: mockTestCases[id] || []
  };
  
  return {
    success: true,
    data: testRunWithCases
  };
}

/**
 * Simulates creating a new test run
 */
export async function createTestRun(testRunData: Partial<TestRun>): Promise<{
  success: boolean;
  data?: TestRun;
  error?: string;
}> {
  logger.debug('Creating new test run in mock API', testRunData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, we would save the data to a database
  // For mock purposes, we'll just return success
  
  return {
    success: true,
    data: {
      id: `tr-${Date.now()}`,
      ...testRunData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as TestRun
  };
} 