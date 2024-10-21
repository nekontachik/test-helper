import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestCaseDetails } from '@/components/TestCaseDetails';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

// Mock the entire hooks module
jest.mock('@/hooks/useTestCases', () => ({
  useTestCases: jest.fn(),
}));

const mockTestCase: TestCase = {
  id: '1',
  title: 'Test Case 1',
  description: 'Description for Test Case 1',
  expectedResult: 'Expected Result 1',
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.HIGH,
  projectId: 'project1',
  version: 1,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02'),
};

describe('TestCaseDetails', () => {
  it('renders test case details correctly', () => {
    render(
      <ChakraProvider>
        <TestCaseDetails testCase={mockTestCase} onClose={jest.fn()} />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Description for Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Expected Result: Expected Result 1')).toBeInTheDocument();
    expect(screen.getByText('Status: ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Priority: HIGH')).toBeInTheDocument();
    expect(screen.getByText('Version: 1')).toBeInTheDocument();
  });

  it('displays version history when button is clicked', async () => {
    const mockVersions = [
      { version: 2, updatedAt: '2023-05-02T10:00:00Z', title: 'Updated Test Case' },
      { version: 1, updatedAt: '2023-05-01T10:00:00Z', title: 'Original Test Case' },
    ];

    // Mock the useTestCases hook to return version history
    jest.spyOn(require('@/hooks/useTestCases'), 'useTestCases').mockReturnValue({
      data: { versions: mockVersions },
      isLoading: false,
      error: null,
    });

    render(
      <ChakraProvider>
        <TestCaseDetails testCase={mockTestCase} onClose={jest.fn()} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('View Version History'));

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Updated Test Case')).toBeInTheDocument();
      expect(screen.getByText('Original Test Case')).toBeInTheDocument();
    });
  });
});
