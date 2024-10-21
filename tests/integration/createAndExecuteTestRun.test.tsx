import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateTestRunPage from '@/app/projects/[projectId]/test-runs/create/page';
import TestRunExecutionPage from '@/app/projects/[projectId]/test-runs/execute/page';
import { apiClient } from '@/lib/apiClient';
import { CreateTestRunForm } from '@/components/CreateTestRunForm';
import { ExecuteTestRun } from '@/components/ExecuteTestRun';
import { useCreateTestRun, useUpdateTestRun, useTestRun } from '@/hooks/useTestRuns';
import { TestRunStatus, TestCaseResultStatus } from '@/types';

jest.mock('@/lib/apiClient');
jest.mock('@/hooks/useTestRuns');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    query: { projectId: 'project1' },
    push: jest.fn(),
  }),
}));

const queryClient = new QueryClient();

describe('Create and Execute Test Run Flow', () => {
  const mockCreateTestRun = jest.fn();
  const mockUpdateTestRun = jest.fn();
  const mockTestRun = { id: 'run1', name: 'Test Run 1', testCases: [] };

  beforeEach(() => {
    (useCreateTestRun as jest.Mock).mockReturnValue({
      mutateAsync: mockCreateTestRun,
      isLoading: false,
    });
    (useUpdateTestRun as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdateTestRun,
      isLoading: false,
    });
    (useTestRun as jest.Mock).mockReturnValue({
      data: mockTestRun,
      isLoading: false,
      error: null,
    });
  });

  it('creates a test run and executes it', async () => {
    const mockTestCases = [
      { id: '1', title: 'Test Case 1' },
      { id: '2', title: 'Test Case 2' },
    ];

    (apiClient.getTestCases as jest.Mock).mockResolvedValueOnce({ data: mockTestCases });
    (apiClient.createTestRun as jest.Mock).mockResolvedValueOnce(mockTestRun);
    (apiClient.updateTestRun as jest.Mock).mockResolvedValueOnce({ ...mockTestRun, status: TestRunStatus.COMPLETED });

    // Render Create Test Run Page
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <CreateTestRunPage />
        </QueryClientProvider>
      </ChakraProvider>
    );

    // Fill in test run details
    fireEvent.change(screen.getByLabelText('Test Run Name'), {
      target: { value: 'Test Run 1' },
    });
    fireEvent.click(screen.getByLabelText('Test Case 1'));
    fireEvent.click(screen.getByLabelText('Test Case 2'));
    fireEvent.click(screen.getByText('Create Test Run'));

    await waitFor(() => {
      expect(apiClient.createTestRun).toHaveBeenCalledWith('project1', {
        name: 'Test Run 1',
        testCaseIds: ['1', '2'],
      });
    });

    // Render Test Run Execution Page
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <TestRunExecutionPage />
        </QueryClientProvider>
      </ChakraProvider>
    );

    // Execute test cases
    fireEvent.change(screen.getAllByLabelText('Status')[0], {
      target: { value: TestCaseResultStatus.PASSED },
    });
    fireEvent.change(screen.getAllByLabelText('Status')[1], {
      target: { value: TestCaseResultStatus.FAILED },
    });
    fireEvent.change(screen.getAllByLabelText('Notes')[1], {
      target: { value: 'Bug found' },
    });
    fireEvent.click(screen.getByText('Complete Test Run'));

    await waitFor(() => {
      expect(apiClient.updateTestRun).toHaveBeenCalledWith('project1', 'run1', {
        status: TestRunStatus.COMPLETED,
        testCaseResults: [
          { testCaseId: '1', status: TestCaseResultStatus.PASSED, notes: '' },
          { testCaseId: '2', status: TestCaseResultStatus.FAILED, notes: 'Bug found' },
        ],
      });
    });

    expect(screen.getByText('Test Run Completed')).toBeInTheDocument();
  });
});
