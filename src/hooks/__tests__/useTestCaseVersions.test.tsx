import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTestCaseVersions, useRestoreTestCaseVersion } from '../useTestCase';
import apiClient from '../../lib/apiClient';

jest.mock('../../lib/apiClient');

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTestCaseVersions', () => {
  it('fetches test case versions', async () => {
    const mockVersions = [
      { id: '1', versionNumber: 1, title: 'Test Case 1 v1' },
      { id: '2', versionNumber: 2, title: 'Test Case 1 v2' },
    ];
    (apiClient.getTestCaseVersions as jest.Mock).mockResolvedValue(mockVersions);

    const { result } = renderHook(() => useTestCaseVersions('project1', 'testcase1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockVersions);
  });
});

describe('useRestoreTestCaseVersion', () => {
  it('restores a test case version', async () => {
    const mockRestoredTestCase = { id: '1', title: 'Restored Test Case', version: 2 };
    (apiClient.restoreTestCaseVersion as jest.Mock).mockResolvedValue(mockRestoredTestCase);

    const { result } = renderHook(() => useRestoreTestCaseVersion('project1', 'testcase1'), {
      wrapper: createWrapper(),
    });

    result.current.mutate(2);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRestoredTestCase);
    expect(apiClient.restoreTestCaseVersion).toHaveBeenCalledWith('project1', 'testcase1', 2);
  });
});
