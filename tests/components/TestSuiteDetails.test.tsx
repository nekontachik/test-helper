import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestSuiteDetails } from '../TestSuiteDetails';
import { useTestCases } from '@/hooks/useTestCases';
import { TestSuite, TestCase, TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/hooks/useTestCases');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('TestSuiteDetails', () => {
  const mockTestSuite: TestSuite = {
    id: '1',
    name: 'Test Suite 1',
    description: 'Test Suite Description',
    projectId: 'project1',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-02T00:00:00Z'),
    testCases: ['1', '2'], // Array of test case IDs
  };

  const mockTestCases: TestCase[] = [
    {
      id: '1',
      title: 'Test Case 1',
      description: 'Test Case 1 Description',
      steps: 'Step 1\nStep 2\nStep 3',  // Added missing steps
      expectedResult: 'Expected Result 1',
      actualResult: 'Actual Result 1',   // Added missing actualResult
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
      projectId: 'project1',
      version: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Case 2',
      description: 'Test Case 2 Description',
      steps: 'Step 1\nStep 2\nStep 3',  // Added missing steps
      expectedResult: 'Expected Result 2',
      actualResult: 'Actual Result 2',   // Added missing actualResult
      status: TestCaseStatus.INACTIVE,
      priority: TestCasePriority.LOW,
      projectId: 'project1',
      version: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: { data: mockTestCases },
      isLoading: false,
      error: null,
    });
  });

  it('renders test suite details correctly', () => {
    render(<TestSuiteDetails testSuite={mockTestSuite} />);
    expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    expect(screen.getByText('Test Suite Description')).toBeInTheDocument();
    expect(screen.getByText('Total Test Cases: 2')).toBeInTheDocument();
  });

  it('renders test cases correctly', () => {
    render(<TestSuiteDetails testSuite={mockTestSuite} />);
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
    expect(screen.getByText(`Priority: ${TestCasePriority.HIGH}`)).toBeInTheDocument();
    expect(screen.getByText(`Priority: ${TestCasePriority.LOW}`)).toBeInTheDocument();
    expect(screen.getByText(`Status: ${TestCaseStatus.ACTIVE}`)).toBeInTheDocument();
    expect(screen.getByText(`Status: ${TestCaseStatus.INACTIVE}`)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<TestSuiteDetails testSuite={mockTestSuite} />);
    expect(screen.getByText('Loading test cases...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load test cases'),
    });
    render(<TestSuiteDetails testSuite={mockTestSuite} />);
    expect(screen.getByText('Error loading test cases: Failed to load test cases')).toBeInTheDocument();
  });

  it('displays message when no test cases are found', () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: null,
    });
    render(<TestSuiteDetails testSuite={mockTestSuite} />);
    expect(screen.getByText('No test cases in this suite')).toBeInTheDocument();
  });
});
