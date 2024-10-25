import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestSuiteDetails } from '@/components/TestSuiteDetails';
import { TestSuite, TestCase, TestCaseStatus, TestCasePriority } from '@/types';
import { useTestCases } from '@/hooks/useTestCases';

jest.mock('@/hooks/useTestCases');

const mockTestCases: TestCase[] = [
  {
    id: '1',
    title: 'Test Case 1',
    description: 'Description 1',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    projectId: 'project1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    expectedResult: 'Expected Result 1',
    version: 1,
    steps: 'Step 1\nStep 2',
    actualResult: 'Actual Result 1',
  },
  {
    id: '2',
    title: 'Test Case 2',
    description: 'Description 2',
    status: TestCaseStatus.DRAFT,
    priority: TestCasePriority.MEDIUM,
    projectId: 'project1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    expectedResult: 'Expected Result 2',
    version: 1,
    steps: 'Step 1\nStep 2',
    actualResult: 'Actual Result 2',
  },
];

const mockTestSuite: TestSuite = {
  id: '1',
  name: 'Test Suite 1',
  description: 'Description of Test Suite 1',
  projectId: 'project1',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-02T00:00:00Z'),
};

describe('TestSuiteDetails', () => {
  beforeEach(() => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: { data: mockTestCases },
      isLoading: false,
      error: null,
    });
  });

  it('renders test suite details correctly', () => {
    render(
      <ChakraProvider>
        <TestSuiteDetails testSuite={mockTestSuite} />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    expect(screen.getByText('Description of Test Suite 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('displays the correct number of test cases', () => {
    render(
      <ChakraProvider>
        <TestSuiteDetails testSuite={mockTestSuite} />
      </ChakraProvider>
    );

    expect(screen.getByText('Total Test Cases: 2')).toBeInTheDocument();
  });

  it('handles test suite without test cases', () => {
    (useTestCases as jest.Mock).mockReturnValueOnce({
      data: { data: [] },
      isLoading: false,
      error: null,
    });

    render(
      <ChakraProvider>
        <TestSuiteDetails testSuite={mockTestSuite} />
      </ChakraProvider>
    );

    expect(screen.getByText('Total Test Cases: 0')).toBeInTheDocument();
    expect(screen.getByText('No test cases in this suite')).toBeInTheDocument();
  });
});
