import { renderHook, act } from '@testing-library/react';
import { useTestCases } from '@/hooks/useTestCases';
import { useCreateTestCase, useUpdateTestCase } from '@/hooks/useTestCase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

jest.mock('@/lib/apiClient');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTestCases', () => {
  it('fetches test cases correctly', async () => {
    const mockTestCases = [{ id: '1', title: 'Test Case 1' }];
    (apiClient.getTestCases as jest.Mock).mockResolvedValue(mockTestCases);

    const { result } = renderHook(() => useTestCases('project1'), { wrapper });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual(mockTestCases);
  });

  it('handles API errors correctly', async () => {
    const errorMessage = 'Failed to fetch test cases';
    (apiClient.getTestCases as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTestCases('project1'), { wrapper });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toEqual(new Error(errorMessage));
  });
});

describe('useCreateTestCase', () => {
  const projectId = 'project1';

  it('creates a test case correctly', async () => {
    const mockNewTestCase = { id: '2', title: 'New Test Case' };
    (apiClient.createTestCase as jest.Mock).mockResolvedValue(mockNewTestCase);

    const { result } = renderHook(() => useCreateTestCase(projectId), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ title: 'New Test Case' });
    });

    expect(result.current.data).toEqual(mockNewTestCase);
  });

  it('handles creation errors correctly', async () => {
    const errorMessage = 'Failed to create test case';
    (apiClient.createTestCase as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCreateTestCase(projectId), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({ title: 'New Test Case' });
      } catch (error) {
        expect(error).toEqual(new Error(errorMessage));
      }
    });
  });
});

describe('useUpdateTestCase', () => {
  const projectId = 'project1';
  const testCaseId = 'test1';

  it('updates a test case correctly', async () => {
    const mockUpdatedTestCase = { id: '1', title: 'Updated Test Case' };
    (apiClient.updateTestCase as jest.Mock).mockResolvedValue(mockUpdatedTestCase);

    const { result } = renderHook(() => useUpdateTestCase(projectId, testCaseId), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ title: 'Updated Test Case' });
    });

    expect(result.current.data).toEqual(mockUpdatedTestCase);
  });

  it('handles update errors correctly', async () => {
    const errorMessage = 'Failed to update test case';
    (apiClient.updateTestCase as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUpdateTestCase(projectId, testCaseId), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({ title: 'Updated Test Case' });
      } catch (error) {
        expect(error).toEqual(new Error(errorMessage));
      }
    });
  });
});
