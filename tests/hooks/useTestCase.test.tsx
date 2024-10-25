import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useTestCase } from '@/hooks/useTestCase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import  apiClient  from '@/lib/apiClient';

// Mock the API call
jest.mock('../../lib/apiClient');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const TestComponent: React.FC<{ projectId: string; testCaseId: string }> = ({
  projectId,
  testCaseId,
}) => {
  const { data, isLoading, error } = useTestCase(projectId, testCaseId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return <div>Test Case: {JSON.stringify(data)}</div>;
};

describe('useTestCase', () => {
  it('should return test case data', async () => {
    render(<TestComponent projectId="projectId" testCaseId="testCaseId" />, {
      wrapper,
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Test Case:/)).toBeInTheDocument();
    });

    const testCaseText = screen.getByText(/Test Case:/);
    expect(testCaseText).toHaveTextContent('{"id":"1","title":"Test Case 1"}');
  });

  it('fetches test case successfully', async () => {
    const mockTestCase = {
      id: '1',
      title: 'Test Case 1',
      description: 'Description 1',
    };
    (apiClient.getTestCase as jest.Mock).mockResolvedValue(mockTestCase);

    const { result } = renderHook(() => useTestCase('project1', '1'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTestCase);
  });

  it('handles error when fetching test case fails', async () => {
    const error = new Error('Failed to fetch test case');
    (apiClient.getTestCase as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useTestCase('project1', '1'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});
