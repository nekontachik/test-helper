import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestCaseList } from '@/components/TestCaseList';
import { useTestCases } from '@/hooks/useTestCases';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/hooks/useTestCases');

const mockTestCases: TestCase[] = Array.from({ length: 25 }, (_, i) => ({
  id: `tc-${i + 1}`,
  title: `Test Case ${i + 1}`,
  description: `Description for Test Case ${i + 1}`,
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.MEDIUM,
  expectedResult: `Expected Result ${i + 1}`,
  projectId: 'project1',
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

describe('TestCaseList', () => {
  beforeEach(() => {
    (useTestCases as jest.Mock).mockReturnValue({
      testCases: mockTestCases,
      isLoading: false,
      error: null,
      totalPages: 3,
      currentPage: 1,
    });
  });

  it('renders test cases correctly', () => {
    render(
      <ChakraProvider>
        <TestCaseList projectId="project1" />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('filters test cases by title, status, and priority', async () => {
    render(
      <ChakraProvider>
        <TestCaseList projectId="project1" />
      </ChakraProvider>
    );

    // Filter by title
    fireEvent.change(screen.getByPlaceholderText('Filter by title'), {
      target: { value: 'Test Case 1' },
    });

    // Filter by status
    fireEvent.change(screen.getByLabelText('Filter by status'), {
      target: { value: TestCaseStatus.ACTIVE },
    });

    // Filter by priority
    fireEvent.change(screen.getByLabelText('Filter by priority'), {
      target: { value: TestCasePriority.HIGH },
    });

    await waitFor(() => {
      expect(useTestCases).toHaveBeenCalledWith('project1', {
        title: 'Test Case 1',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
      });
    });
  });

  it('opens create test case modal', () => {
    render(
      <ChakraProvider>
        <TestCaseList projectId="project1" />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Create New Test Case'));
    expect(screen.getByText('Create New Test Case')).toBeInTheDocument();
  });

  it('renders pagination correctly', async () => {
    render(
      <ChakraProvider>
        <TestCaseList projectId="project1" />
      </ChakraProvider>
    );

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(useTestCases).toHaveBeenCalledWith('project1', expect.objectContaining({ page: 2 }));
    });

    (useTestCases as jest.Mock).mockReturnValue({
      testCases: mockTestCases.slice(10, 20),
      isLoading: false,
      error: null,
      totalPages: 3,
      currentPage: 2,
    });

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('handles the last page correctly', async () => {
    (useTestCases as jest.Mock).mockReturnValue({
      testCases: mockTestCases.slice(20),
      isLoading: false,
      error: null,
      totalPages: 3,
      currentPage: 3,
    });

    render(
      <ChakraProvider>
        <TestCaseList projectId="project1" />
      </ChakraProvider>
    );

    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  // Add more tests as needed
});
