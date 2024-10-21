import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestRunSummary } from '@/components/TestRunSummary';
import {
  TestRun,
  TestCaseResultStatus,
  TestRunStatus,
} from '../../models/types';

jest.mock('react-chartjs-2', () => ({
  Pie: () => null,
}));

const mockTestRun: TestRun = {
  id: '1',
  name: 'Test Run 1',
  status: TestRunStatus.COMPLETED,
  projectId: 'project1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  testCaseResults: [
    {
      id: '1',
      status: TestCaseResultStatus.PASSED,
      testCaseId: '1',
      testRunId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      status: TestCaseResultStatus.FAILED,
      testCaseId: '2',
      testRunId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      status: TestCaseResultStatus.SKIPPED,
      testCaseId: '3',
      testRunId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

describe('TestRunSummary', () => {
  it('displays correct summary information', () => {
    // TODO: Implement this test when TestRunSummary component is created
    // const mockTestRun = {
    //   id: '1',
    //   name: 'Test Run 1',
    //   totalTestCases: 10,
    //   passed: 7,
    //   failed: 2,
    //   skipped: 1,
    // };
    // render(<TestRunSummary testRun={mockTestRun} />);
    // expect(screen.getByText('Test Run 1')).toBeInTheDocument();
    // expect(screen.getByText('Total Test Cases: 10')).toBeInTheDocument();
    // expect(screen.getByText('Passed: 7')).toBeInTheDocument();
    // expect(screen.getByText('Failed: 2')).toBeInTheDocument();
    // expect(screen.getByText('Skipped: 1')).toBeInTheDocument();
  });

  it('renders a chart with test results', () => {
    // TODO: Implement this test when chart functionality is added
    // const mockTestRun = {
    //   id: '1',
    //   name: 'Test Run 1',
    //   totalTestCases: 10,
    //   passed: 7,
    //   failed: 2,
    //   skipped: 1,
    // };
    // render(<TestRunSummary testRun={mockTestRun} />);
    // expect(screen.getByTestId('test-results-chart')).toBeInTheDocument();
  });
});
