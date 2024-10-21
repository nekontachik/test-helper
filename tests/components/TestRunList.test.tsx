import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestRunList } from '../../components/TestRunList';
import { TestRun, TestRunStatus } from '../../models/types';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockTestRuns: TestRun[] = [
  {
    id: '1',
    name: 'Test Run 1',
    status: TestRunStatus.COMPLETED,
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Test Run 2',
    status: TestRunStatus.IN_PROGRESS,
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('TestRunList', () => {
  it('renders test runs correctly', () => {
    render(
      <ChakraProvider>
        <TestRunList testRuns={mockTestRuns} projectId="project1" />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Run 1')).toBeInTheDocument();
    expect(screen.getByText('Test Run 2')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
  });

  it('displays a message when there are no test runs', () => {
    render(
      <ChakraProvider>
        <TestRunList testRuns={[]} projectId="project1" />
      </ChakraProvider>
    );

    expect(screen.getByText('No test runs found')).toBeInTheDocument();
  });

  it('renders create new test run button', () => {
    render(
      <ChakraProvider>
        <TestRunList testRuns={mockTestRuns} projectId="project1" />
      </ChakraProvider>
    );

    expect(screen.getByText('Create New Test Run')).toBeInTheDocument();
  });

  it('navigates to test run details when a test run is clicked', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <ChakraProvider>
        <TestRunList testRuns={mockTestRuns} projectId="project1" />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Test Run 1'));

    expect(mockPush).toHaveBeenCalledWith('/projects/project1/test-runs/1');
  });

  it('navigates to create new test run page when create button is clicked', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <ChakraProvider>
        <TestRunList testRuns={mockTestRuns} projectId="project1" />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Create New Test Run'));

    expect(mockPush).toHaveBeenCalledWith('/projects/project1/test-runs/new');
  });
});
