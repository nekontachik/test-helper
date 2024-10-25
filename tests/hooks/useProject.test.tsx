import { renderHook, waitFor } from '@testing-library/react';
import { useProject } from '@/hooks/useProject';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import React from 'react';

jest.mock('@/lib/apiClient');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useProject', () => {
  it('fetches project data successfully', async () => {
    const mockProject = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
    };
    (apiClient.getProject as jest.Mock).mockResolvedValue(mockProject);

    const { result } = renderHook(() => useProject('1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProject);
  });

  it('handles error when fetching project fails', async () => {
    const error = new Error('Failed to fetch project');
    (apiClient.getProject as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProject('1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('does not fetch when projectId is undefined', () => {
    const { result } = renderHook(() => useProject(null), { wrapper });

    expect(result.current.isLoading).toBe(false);
  });

  it('handles empty projectId', () => {
    const { result } = renderHook(() => useProject(''), { wrapper });

    expect(result.current.isLoading).toBe(false);
  });
});
