import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestRunList } from '../../components/TestRunList';
import type { TestRun} from '@/types';
import { TestRunStatus } from '@/types';

const mockTestRuns: TestRun[] = [
  {
    id: '1',
    name: 'Test Run 1',
    status: TestRunStatus.COMPLETED,
    projectId: 'project1',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  },
  {
    id: '2',
    name: 'Test Run 2',
    status: TestRunStatus.IN_PROGRESS,
    projectId: 'project1',
    createdAt: new Date('2023-01-02T00:00:00Z'),
    updatedAt: new Date('2023-01-02T00:00:00Z'),
  },
];

describe('TestRunList', () => {
  it('renders test runs correctly', () => {
    const mockOnTestRunClick = jest.fn();
    render(
      <ChakraProvider>
        <TestRunList data={mockTestRuns} onTestRunClick={mockOnTestRunClick} />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Run 1')).toBeInTheDocument();
    expect(screen.getByText('Test Run 2')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
  });

  it('displays a message when there are no test runs', () => {
    const mockOnTestRunClick = jest.fn();
    render(
      <ChakraProvider>
        <TestRunList data={[]} onTestRunClick={mockOnTestRunClick} />
      </ChakraProvider>
    );

    expect(screen.getByText('No test runs found.')).toBeInTheDocument();
  });

  it('calls onTestRunClick when a test run is clicked', () => {
    const mockOnTestRunClick = jest.fn();
    render(
      <ChakraProvider>
        <TestRunList data={mockTestRuns} onTestRunClick={mockOnTestRunClick} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Test Run 1'));

    expect(mockOnTestRunClick).toHaveBeenCalledWith(mockTestRuns[0]);
  });
});
