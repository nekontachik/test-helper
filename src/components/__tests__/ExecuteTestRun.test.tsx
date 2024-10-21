import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExecuteTestRun } from '../ExecuteTestRun';
import { TestRun, TestCase, TestCaseStatus, TestCasePriority, TestCaseResultStatus } from '@/types';
import { useUpdateTestRun } from '@/hooks/useTestRuns';

jest.mock('@/hooks/useTestRuns');

const createMockTestCase = (id: string, title: string, priority: TestCasePriority): TestCase => ({
  id,
  title,
  description: `Description for ${title}`,
  expectedResult: `Expected Result for ${title}`,
  priority,
  status: TestCaseStatus.ACTIVE,
  projectId: 'project1',
  version: 1,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
});

const mockTestRun: TestRun = {
  id: '1',
  name: 'Test Run 1',
  status: 'IN_PROGRESS',
  projectId: 'project1',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-02T00:00:00Z'),
  testCases: [
    createMockTestCase('tc1', 'Test Case 1', TestCasePriority.HIGH),
    createMockTestCase('tc2', 'Test Case 2', TestCasePriority.MEDIUM),
  ],
};

describe('ExecuteTestRun', () => {
  const mockOnComplete = jest.fn();
  const mockUpdateTestRun = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpdateTestRun as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdateTestRun,
      isLoading: false,
    });
  });

  it('renders correctly', () => {
    render(<ExecuteTestRun testRun={mockTestRun} onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Execute Test Run: Test Run 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('renders test cases correctly', () => {
    render(<ExecuteTestRun testRun={mockTestRun} onComplete={mockOnComplete} />);
    expect(screen.getByText('Execute Test Run: Test Run 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('allows selecting result for each test case', async () => {
    render(<ExecuteTestRun testRun={mockTestRun} onComplete={mockOnComplete} />);
    
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

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('handles errors when updating test run', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockUpdateTestRun.mockRejectedValueOnce(new Error('Update failed'));

    render(<ExecuteTestRun testRun={mockTestRun} onComplete={mockOnComplete} />);
    
    fireEvent.click(screen.getByText('Complete Test Run'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating test run:', expect.any(Error));
    });

    expect(mockOnComplete).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
