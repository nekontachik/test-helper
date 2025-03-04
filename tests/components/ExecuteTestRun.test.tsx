import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExecuteTestRun } from '@/components/test-run/ExecuteTestRun';
import type { TestCase} from '@/types';
import { TestRun, TestCaseStatus, TestCasePriority, TestCaseResultStatus } from '@/types';
import { useUpdateTestRun } from '@/hooks/testRuns';
import { ChakraProvider } from '@chakra-ui/react';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('@/hooks/useTestRuns');

// Memoize the createMockTestCase function to improve performance
const createMockTestCase = (id: string, title: string, priority: TestCasePriority): TestCase => ({
  id,
  title,
  description: `Description for ${title}`,
  steps: `Step 1 for ${title}\nStep 2 for ${title}`,  // Added required steps
  expectedResult: `Expected Result for ${title}`,
  actualResult: `Actual Result for ${title}`,  // Added required actualResult
  priority,
  status: TestCaseStatus.ACTIVE,
  projectId: 'project1',
  version: 1,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
});

const mockTestCases: TestCase[] = [
  createMockTestCase('1', 'Test Case 1', TestCasePriority.HIGH),
  createMockTestCase('2', 'Test Case 2', TestCasePriority.MEDIUM),
];

const mockTestRun = {
  id: '1',
  name: 'Test Run 1',
  status: 'IN_PROGRESS',
  projectId: 'project1',
  testCases: mockTestCases,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ExecuteTestRun', () => {
  const mockUpdateTestRun = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpdateTestRun as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdateTestRun,
      isLoading: false,
    });
  });

  it('renders correctly', () => {
    render(
      <ChakraProvider>
        <ExecuteTestRun 
          testRun={mockTestRun} 
          projectId="project1" 
          runId="1" 
        />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Execute Test Run: Test Run 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('renders test cases correctly', () => {
    render(
      <ChakraProvider>
        <ExecuteTestRun 
          testRun={mockTestRun} 
          projectId="project1" 
          runId="1" 
        />
      </ChakraProvider>
    );
    expect(screen.getByText('Execute Test Run: Test Run 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('allows selecting result for each test case', async () => {
    render(
      <ChakraProvider>
        <ExecuteTestRun 
          testRun={mockTestRun} 
          projectId="project1" 
          runId="1" 
        />
      </ChakraProvider>
    );
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: TestCaseResultStatus.PASSED } });
    fireEvent.change(selects[1], { target: { value: TestCaseResultStatus.FAILED } });

    const textareas = screen.getAllByRole('textbox');
    fireEvent.change(textareas[0], { target: { value: 'Test case 1 passed' } });
    fireEvent.change(textareas[1], { target: { value: 'Test case 2 failed' } });

    fireEvent.click(screen.getByText('Complete Test Run'));

    await waitFor(() => {
      expect(mockUpdateTestRun).toHaveBeenCalledWith({
        testRunId: '1',
        data: {
          status: 'COMPLETED',
          testCaseResults: [
            { testCaseId: 'tc1', status: TestCaseResultStatus.PASSED, notes: 'Test case 1 passed', testRunId: '1' },
            { testCaseId: 'tc2', status: TestCaseResultStatus.FAILED, notes: 'Test case 2 failed', testRunId: '1' },
          ],
        },
      });
    });
  });

  it('handles errors when updating test run', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockUpdateTestRun.mockRejectedValueOnce(new Error('Update failed'));

    render(
      <ChakraProvider>
        <ExecuteTestRun 
          testRun={mockTestRun} 
          projectId="project1" 
          runId="1" 
        />
      </ChakraProvider>
    );
    
    fireEvent.click(screen.getByText('Complete Test Run'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating test run:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});
