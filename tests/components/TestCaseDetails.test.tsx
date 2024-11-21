import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TestCaseDetails from '../TestCaseDetails';
import apiClient from '@/lib/apiClient';

jest.mock('@/lib/apiClient');
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { role: 'ADMIN' } }, status: 'authenticated' }),
}));

const mockTestCase = {
  id: '1',
  title: 'Test Case 1',
  description: 'Description 1',
  steps: 'Steps 1',
  expectedResult: 'Expected Result 1',
  status: 'ACTIVE',
  priority: 'HIGH',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  projectId: 'project1',
};

const mockVersions = [
  { ...mockTestCase, versionNumber: 1 },
  { ...mockTestCase, title: 'Test Case 1 v2', versionNumber: 2 },
];

describe('TestCaseDetails', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    (apiClient.getTestCase as jest.Mock).mockResolvedValue(mockTestCase);
    (apiClient.getTestCaseVersions as jest.Mock).mockResolvedValue(mockVersions);
  });

  it('renders test case details', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TestCaseDetails projectId="project1" testCaseId="1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Case 1')).toBeInTheDocument();
      expect(screen.getByText('Description: Description 1')).toBeInTheDocument();
      expect(screen.getByText('Steps: Steps 1')).toBeInTheDocument();
      expect(screen.getByText('Expected Result: Expected Result 1')).toBeInTheDocument();
      expect(screen.getByText('Status: ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('Priority: HIGH')).toBeInTheDocument();
    });
  });

  it('displays version selector', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TestCaseDetails projectId="project1" testCaseId="1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });
  });

  // Add more tests as needed
});
