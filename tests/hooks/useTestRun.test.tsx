import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTestRun } from '../../hooks/useTestRun';
import { apiClient } from '../../lib/apiClient';
import { TestRunStatus } from '../../models/types';

jest.mock('../../lib/apiClient');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTestRun', () => {
  it('fetches test run successfully', async () => {
    const mockTestRun = {
      id: '1',
      name: 'Test Run 1',
      status: TestRunStatus.IN_PROGRESS,
      projectId: 'project1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      testCases: [],
    };
    (apiClient.getTestRun as jest.Mock).mockResolvedValue(mockTestRun);

    const { result } = renderHook(() => useTestRun('project1', '1'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTestRun);
  });

  it('handles error when fetching test run fails', async () => {
    const error = new Error('Failed to fetch test run');
    (apiClient.getTestRun as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useTestRun('project1', '1'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('returns undefined data when projectId or testRunId is not provided', async () => {
    const { result } = renderHook(() => useTestRun(undefined, undefined), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeUndefined();
  });
});
