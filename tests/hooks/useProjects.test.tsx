import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react'; // Add waitFor to the import
import { useProjects } from '../../hooks/useProjects';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';

jest.mock('../../lib/apiClient');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useProjects', () => {
  it('should return projects', async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('handles error when fetching projects fails', async () => {
    const error = new Error('Failed to fetch projects');
    (apiClient.getProjects as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});
