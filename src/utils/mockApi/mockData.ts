import type { Project, TestRun, TestCase } from './types';

/**
 * Mock projects data
 */
export const mockProjects: Project[] = [
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

/**
 * Mock test runs data
 */
export const mockTestRuns: TestRun[] = [
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

/**
 * Mock test cases for test run details
 */
export const mockTestCases: Record<string, TestCase[]> = {
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