import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTestSuite } from '../../hooks/useTestSuite';
import { apiClient } from '../../lib/apiClient';

jest.mock('../../lib/apiClient');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTestSuite', () => {
  it('fetches test suite successfully', async () => {
    const mockTestSuite = {
      id: '1',
      name: 'Test Suite 1',
      description: 'Description 1',
      projectId: 'project1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      testCases: [],
    };
    (apiClient.getTestSuite as jest.Mock).mockResolvedValue(mockTestSuite);

    const { result } = renderHook(() => useTestSuite('project1', '1'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTestSuite);
  });

  it('handles error when fetching test suite fails', async () => {
    const error = new Error('Failed to fetch test suite');
    (apiClient.getTestSuite as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useTestSuite('project1', '1'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});
