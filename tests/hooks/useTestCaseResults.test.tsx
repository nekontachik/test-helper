import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTestCaseResults } from '../../hooks/useTestCaseResults';
import { apiClient } from '../../lib/apiClient';

jest.mock('../../lib/apiClient');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTestCaseResults', () => {
  it('fetches test case results successfully', async () => {
    const mockResults = [
      { id: '1', testCaseId: '1', status: 'PASSED', notes: 'Test passed' },
      { id: '2', testCaseId: '2', status: 'FAILED', notes: 'Test failed' },
    ];
    (apiClient.getTestCaseResults as jest.Mock).mockResolvedValue(mockResults);

    const { result } = renderHook(
      () => useTestCaseResults('project1', 'testRun1'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResults);
  });

  it('handles error when fetching test case results fails', async () => {
    const error = new Error('Failed to fetch test case results');
    (apiClient.getTestCaseResults as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(
      () => useTestCaseResults('project1', 'testRun1'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});
