import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTestCase, useTestCaseVersions, useRestoreTestCaseVersion } from '../useTestCase';
import apiClient from '../../lib/apiClient';

jest.mock('../../lib/apiClient');

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTestCase', () => {
  it('fetches a test case', async () => {
    const mockTestCase = { id: '1', title: 'Test Case 1' };
    (apiClient.getTestCase as jest.Mock).mockResolvedValue(mockTestCase);

    const { result } = renderHook(() => useTestCase('project1', '1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTestCase);
  });
});

// ... rest of the tests remain the same
