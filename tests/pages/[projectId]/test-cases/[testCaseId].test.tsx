import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TestCasePage from '@/app/projects/[projectId]/test-cases/[testCaseId]/page';
import { useRouter } from 'next/router';
import { useTestCase } from '@/hooks/useTestCase';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useTestCase');

const queryClient = new QueryClient();

describe('TestCasePage', () => {
  const mockParams = {
    projectId: 'project1',
    testCaseId: 'testCase1'
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: mockParams,
    });
  });

  it('renders loading state', () => {
    (useTestCase as jest.Mock).mockReturnValue({
      testCase: null,
      isLoading: true,
      isError: false,
    });

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <TestCasePage params={mockParams} />
        </QueryClientProvider>
      </ChakraProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useTestCase as jest.Mock).mockReturnValue({
      testCase: null,
      isLoading: false,
      isError: true,
    });

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <TestCasePage params={mockParams} />
        </QueryClientProvider>
      </ChakraProvider>
    );

    expect(screen.getByText(/failed to load test case/i)).toBeInTheDocument();
  });

  it('renders test case form when data is loaded', () => {
    const mockTestCase = {
      id: 'testCase1',
      title: 'Test Case 1',
      description: 'Description 1',
      status: 'ACTIVE',
      priority: 'HIGH',
    };

    (useTestCase as jest.Mock).mockReturnValue({
      testCase: mockTestCase,
      isLoading: false,
      isError: false,
    });

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <TestCasePage params={mockParams} />
        </QueryClientProvider>
      </ChakraProvider>
    );

    expect(screen.getByText(/edit test case/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Case 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Description 1')).toBeInTheDocument();
  });
});
