import React from 'react';
import { render, screen } from '@testing-library/react';
import TestRunList from '../TestRunList'; // Change to default import if necessary
import { useTestRuns } from '@/hooks/testRuns';
import { TestRunStatus } from '@/types';

jest.mock('@/hooks/testRuns');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('TestRunList', () => {
  const mockTestRuns = [
    { id: '1', name: 'Test Run 1', status: TestRunStatus.COMPLETED, createdAt: new Date('2023-01-01') },
    { id: '2', name: 'Test Run 2', status: TestRunStatus.IN_PROGRESS, createdAt: new Date('2023-01-02') },
  ];

  beforeEach(() => {
    (useTestRuns as jest.Mock).mockReturnValue({
      data: mockTestRuns,
      isLoading: false,
      error: null,
    });
  });

  it('renders test runs correctly', () => {
    render(<TestRunList projectId="project1" />);
    expect(screen.getByText('Test Run 1')).toBeInTheDocument();
    expect(screen.getByText('Test Run 2')).toBeInTheDocument();
    expect(screen.getByText(TestRunStatus.COMPLETED)).toBeInTheDocument();
    expect(screen.getByText(TestRunStatus.IN_PROGRESS)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (useTestRuns as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<TestRunList projectId="project1" />);
    expect(screen.getByText('Loading test runs...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useTestRuns as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load test runs'),
    });
    render(<TestRunList projectId="project1" />);
    expect(screen.getByText('Error loading test runs: Failed to load test runs')).toBeInTheDocument();
  });

  it('displays message when no test runs are found', () => {
    (useTestRuns as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<TestRunList projectId="project1" />);
    expect(screen.getByText('No test runs found for this project.')).toBeInTheDocument();
  });
});
