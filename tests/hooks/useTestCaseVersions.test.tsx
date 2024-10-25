import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTestCaseVersions } from '@/hooks/useTestCase';
import apiClient from '@/lib/apiClient';

jest.mock('@/lib/apiClient', () => ({
  __esModule: true,
  default: {
    getTestCaseVersions: jest.fn(),
  },
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTestCaseVersions', () => {
  it('fetches test case versions successfully', async () => {
    const mockVersions = [1, 2, 3];
    (apiClient.getTestCaseVersions as jest.Mock).mockResolvedValue(mockVersions);

    const { result } = renderHook(() => useTestCaseVersions('project1', 'testCase1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockVersions);
  });

  it('handles error when fetching test case versions fails', async () => {
    const error = new Error('Failed to fetch test case versions');
    (apiClient.getTestCaseVersions as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useTestCaseVersions('project1', 'testCase1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});
