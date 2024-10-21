import React from 'react';
import { render, screen } from '@testing-library/react';
import TestCasePage from '@/pages/projects/[projectId]/test-cases/[testCaseId]';
import { useTestCase } from '@/hooks/useTestCase';

// Mock the useTestCase hook
jest.mock('@/hooks/useTestCase');

describe('TestCasePage', () => {
  it('renders loading state', () => {
    (useTestCase as jest.Mock).mockReturnValue({
      testCase: null,
      isLoading: true,
      isError: false,
    });

    render(<TestCasePage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useTestCase as jest.Mock).mockReturnValue({
      testCase: null,
      isLoading: false,
      isError: true,
    });

    render(<TestCasePage />);
    expect(screen.getByText(/failed to load test case/i)).toBeInTheDocument();
  });

  it('renders test case form when data is loaded', () => {
    const mockTestCase = {
      id: '1',
      title: 'Test Case 1',
      // ... other properties
    };

    (useTestCase as jest.Mock).mockReturnValue({
      testCase: mockTestCase,
      isLoading: false,
      isError: false,
    });

    render(<TestCasePage />);
    expect(screen.getByText(/edit test case/i)).toBeInTheDocument();
    // Add more assertions based on your TestCaseForm component
  });
});
