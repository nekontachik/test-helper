import React from 'react';
import { render, screen } from '@testing-library/react';
import TestCasePage from '@/app/projects/[projectId]/test-cases/[testCaseId]/page';
import { useTestCase } from '@/hooks/useTestCase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useTestCase hook
jest.mock('@/hooks/useTestCase');

const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('TestCasePage', () => {
  const mockParams = {
    params: {
      projectId: '1',
      testCaseId: '1'
    }
  };

  it('renders loading state', () => {
    (useTestCase as jest.Mock).mockReturnValue({
      testCase: null,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<TestCasePage {...mockParams} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useTestCase as jest.Mock).mockReturnValue({
      testCase: null,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<TestCasePage {...mockParams} />);
    expect(screen.getByText(/failed to load test case/i)).toBeInTheDocument();
  });

  it('renders test case form when data is loaded', () => {
    const mockTestCase = {
      id: '1',
      title: 'Test Case 1',
      description: 'Test description',
      steps: 'Test steps',
      expectedResult: 'Expected result',
      actualResult: 'Actual result',
      status: 'ACTIVE',
      priority: 'HIGH',
      projectId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    (useTestCase as jest.Mock).mockReturnValue({
      testCase: mockTestCase,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<TestCasePage {...mockParams} />);
    expect(screen.getByText(/test case 1/i)).toBeInTheDocument();
  });
});
