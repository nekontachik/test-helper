import { renderHook, waitFor } from '@testing-library/react';
import { useTestSuites } from '@/hooks/useTestSuites';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import React from 'react';

jest.mock('@/lib/apiClient');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTestSuites', () => {
  it('fetches test suites successfully', async () => {
    const mockTestSuites = [{ id: '1', name: 'Test Suite 1' }];
    (apiClient.getTestSuites as jest.Mock).mockResolvedValue(mockTestSuites);

    const { result } = renderHook(() => useTestSuites('project1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTestSuites);
  });

  it('handles error when fetching test suites fails', async () => {
    const error = new Error('Failed to fetch test suites');
    (apiClient.getTestSuites as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useTestSuites('project1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('does not fetch when projectId is undefined', async () => {
    const { result } = renderHook(
      () => useTestSuites(undefined as unknown as string),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(apiClient.getTestSuites).not.toHaveBeenCalled();
  });
});
