import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import { useTestCases, useCreateTestCase, useUpdateTestCase } from './useTestCases';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

jest.mock('../lib/apiClient');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTestCases', () => {
  it('fetches test cases correctly', async () => {
    const mockTestCases = [{ id: '1', title: 'Test Case 1' }];
    (apiClient.getTestCases as jest.Mock).mockResolvedValue(mockTestCases);

    const { result, waitFor } = renderHook(() => useTestCases('project1'), { wrapper });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toEqual(mockTestCases);
  });

  it('handles API errors correctly', async () => {
    const errorMessage = 'Failed to fetch test cases';
    (apiClient.getTestCases as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result, waitFor } = renderHook(() => useTestCases('project1'), { wrapper });

    await waitFor(() => result.current.isError);

    expect(result.current.error).toEqual(new Error(errorMessage));
  });
});

describe('useCreateTestCase', () => {
  it('creates a test case correctly', async () => {
    const mockNewTestCase = { id: '2', title: 'New Test Case' };
    (apiClient.createTestCase as jest.Mock).mockResolvedValue(mockNewTestCase);

    const { result, waitFor } = renderHook(() => useCreateTestCase(), { wrapper });

    act(() => {
      result.current.mutate({ projectId: 'project1', title: 'New Test Case' });
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toEqual(mockNewTestCase);
  });

  it('handles creation errors correctly', async () => {
    const errorMessage = 'Failed to create test case';
    (apiClient.createTestCase as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result, waitFor } = renderHook(() => useCreateTestCase(), { wrapper });

    act(() => {
      result.current.mutate({ projectId: 'project1', title: 'New Test Case' });
    });

    await waitFor(() => result.current.isError);

    expect(result.current.error).toEqual(new Error(errorMessage));
  });
});

describe('useUpdateTestCase', () => {
  it('handles update errors correctly', async () => {
    const errorMessage = 'Failed to update test case';
    (apiClient.updateTestCase as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result, waitFor } = renderHook(() => useUpdateTestCase(), { wrapper });

    act(() => {
      result.current.mutate({ projectId: 'project1', testCaseId: 'tc1', data: { title: 'Updated Test Case' } });
    });

    await waitFor(() => result.current.isError);

    expect(result.current.error).toEqual(new Error(errorMessage));
  });
});
