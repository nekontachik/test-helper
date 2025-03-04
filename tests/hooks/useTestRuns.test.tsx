import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTestRuns, useCreateTestRun, useUpdateTestRun } from '@/hooks/testRuns';
import apiClient from '@/lib/apiClient';
import { TestRunStatus } from '@/types';

jest.mock('@/lib/apiClient');

const queryClient = new QueryClient();

function TestComponent({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useTestRuns(projectId);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>Test Runs: {JSON.stringify(data)}</div>;
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTestRuns', () => {
  it('should fetch test runs', async () => {
    const mockTestRuns = {
      data: [{ id: '1', name: 'Test Run 1', status: 'PLANNED' }],
      totalPages: 1,
      currentPage: 1
    };
    (apiClient.getTestRuns as jest.Mock).mockResolvedValue(mockTestRuns);

    render(<TestComponent projectId="project1" />, { wrapper });

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Test Runs:/)).toBeInTheDocument();
    });

    const testRunsText = screen.getByText(/Test Runs:/);
    expect(testRunsText).toHaveTextContent(JSON.stringify(mockTestRuns));
  });
});

describe('useCreateTestRun', () => {
  it('creates a new test run', async () => {
    const mockCreatedTestRun = { id: '1', name: 'New Test Run', status: TestRunStatus.PENDING };
    (apiClient.createTestRun as jest.Mock).mockResolvedValue(mockCreatedTestRun);

    function CreateTestRunComponent() {
      const createTestRun = useCreateTestRun({ showToasts: true });
      React.useEffect(() => {
        createTestRun.mutate({
          projectId: 'project1',
          testRun: {
            name: 'New Test Run',
            testCaseIds: ['1', '2'],
            status: TestRunStatus.PENDING,
          },
        });
      }, []);

      if (createTestRun.isLoading) return <div>Creating...</div>;
      if (createTestRun.isError) return <div>Error: {createTestRun.error.message}</div>;
      if (createTestRun.isSuccess) return <div>Created: {createTestRun.data.name}</div>;
      return null;
    }

    render(<CreateTestRunComponent />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Created: New Test Run')).toBeInTheDocument();
    });

    expect(apiClient.createTestRun).toHaveBeenCalledWith('project1', {
      name: 'New Test Run',
      testCaseIds: ['1', '2'],
      status: TestRunStatus.PENDING,
    });
  });
});

describe('useUpdateTestRun', () => {
  it('updates an existing test run', async () => {
    const mockUpdatedTestRun = { id: '1', name: 'Updated Test Run', status: TestRunStatus.COMPLETED };
    (apiClient.updateTestRun as jest.Mock).mockResolvedValue(mockUpdatedTestRun);

    function UpdateTestRunComponent() {
      const updateTestRun = useUpdateTestRun('project1');
      React.useEffect(() => {
        updateTestRun.mutate({
          testRunId: 'run1',
          data: {
            status: TestRunStatus.COMPLETED,
            testCaseResults: [
              { testCaseId: '1', status: 'PASSED', notes: 'Test passed successfully' },
            ],
          },
        });
      }, []);

      if (updateTestRun.isLoading) return <div>Updating...</div>;
      if (updateTestRun.isError) return <div>Error: {updateTestRun.error.message}</div>;
      if (updateTestRun.isSuccess) return <div>Updated: {updateTestRun.data.status}</div>;
      return null;
    }

    render(<UpdateTestRunComponent />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Updated: COMPLETED')).toBeInTheDocument();
    });

    expect(apiClient.updateTestRun).toHaveBeenCalledWith('project1', 'run1', {
      status: TestRunStatus.COMPLETED,
      testCaseResults: [
        { testCaseId: '1', status: 'PASSED', notes: 'Test passed successfully' },
      ],
    });
  });
});
