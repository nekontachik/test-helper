import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestRunDetails } from '@/components/TestRunDetails';
import {
  TestRun,
  TestRunStatus,
  TestCaseStatus,
  TestCasePriority,
} from '@/types';

const mockTestRun: TestRun = {
  id: '1',
  name: 'Test Run 1',
  status: TestRunStatus.COMPLETED,
  projectId: 'project1',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
  testCases: [
    {
      id: '1',
      title: 'Test Case 1',
      description: 'Description for Test Case 1',
      expectedResult: 'Expected Result for Test Case 1',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.MEDIUM,
      projectId: 'project1',
      version: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Case 2',
      description: 'Description for Test Case 2',
      expectedResult: 'Expected Result for Test Case 2',
      status: TestCaseStatus.INACTIVE,
      priority: TestCasePriority.HIGH,
      projectId: 'project1',
      version: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ],
};

describe('TestRunDetails', () => {
  it('renders test run details correctly', () => {
    render(
      <ChakraProvider>
        <TestRunDetails testRun={mockTestRun} />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Run 1')).toBeInTheDocument();
    expect(screen.getByText(`Status: ${TestRunStatus.COMPLETED}`)).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('displays the correct number of active and inactive tests', () => {
    render(
      <ChakraProvider>
        <TestRunDetails testRun={mockTestRun} />
      </ChakraProvider>
    );

    expect(screen.getByText('Active: 1 | Inactive: 1')).toBeInTheDocument();
  });

  it('displays the correct status badges for each test case', () => {
    render(
      <ChakraProvider>
        <TestRunDetails testRun={mockTestRun} />
      </ChakraProvider>
    );

    expect(screen.getByText(TestCaseStatus.ACTIVE)).toBeInTheDocument();
    expect(screen.getByText(TestCaseStatus.INACTIVE)).toBeInTheDocument();
  });
});

// TODO: Implement TestRunDetails component and uncomment these tests
/*
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestRunDetails } from '@/components/TestRunDetails';

describe('TestRunDetails', () => {
  it('renders test run details', () => {
    // Test implementation
  });

  // More tests...
});
*/
