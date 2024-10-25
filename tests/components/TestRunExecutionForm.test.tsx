import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestRunExecutionForm } from '@/components/TestRunExecutionForm';
import { TestCase, TestCaseResultStatus, TestCaseStatus, TestCasePriority } from '@/types';

// Create a test wrapper component to reduce re-renders
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

// Memoize test cases to prevent unnecessary re-creation
const mockTestCases: TestCase[] = [
  {
    id: '1',
    title: 'Test Case 1',
    description: 'Description 1',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expectedResult: 'Expected Result 1',
    steps: 'Step 1\nStep 2',
    actualResult: 'Actual Result 1',
    version: 1,
  },
  {
    id: '2',
    title: 'Test Case 2',
    description: 'Description 2',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.MEDIUM,
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expectedResult: 'Expected Result 2',
    steps: 'Step 1\nStep 2',
    actualResult: 'Actual Result 2',
    version: 1,
  },
];

describe('TestRunExecutionForm', () => {
  // Setup function to reduce boilerplate
  const setup = (props = {}) => {
    const mockOnSubmit = jest.fn();
    const utils = render(
      <TestWrapper>
        <TestRunExecutionForm
          testCases={mockTestCases}
          onSubmit={mockOnSubmit}
          {...props}
        />
      </TestWrapper>
    );
    return {
      ...utils,
      mockOnSubmit,
    };
  };

  it('renders test cases correctly', () => {
    setup();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('submits form data correctly', async () => {
    const { mockOnSubmit } = setup();

    fireEvent.change(screen.getAllByLabelText('Status')[0], {
      target: { value: 'PASSED' },
    });
    fireEvent.change(screen.getAllByLabelText('Notes')[0], {
      target: { value: 'Test passed successfully' },
    });

    fireEvent.click(screen.getByText('Submit Results'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        {
          testCaseId: '1',
          status: 'PASSED',
          notes: 'Test passed successfully',
        },
        {
          testCaseId: '2',
          status: 'PENDING',
          notes: '',
        },
      ]);
    });
  });

  it('validates required fields', async () => {
    const { mockOnSubmit } = setup();

    fireEvent.click(screen.getByText('Submit Results'));

    await waitFor(() => {
      expect(
        screen.getByText('Please select a status for all test cases')
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows skipping test cases', async () => {
    const { mockOnSubmit } = setup();

    fireEvent.change(screen.getAllByLabelText('Status')[0], {
      target: { value: 'SKIPPED' },
    });
    fireEvent.change(screen.getAllByLabelText('Notes')[0], {
      target: { value: 'Skipped due to environment issues' },
    });

    fireEvent.click(screen.getByText('Submit Results'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        {
          testCaseId: '1',
          status: 'SKIPPED',
          notes: 'Skipped due to environment issues',
        },
        {
          testCaseId: '2',
          status: 'PENDING',
          notes: '',
        },
      ]);
    });
  });

  it('renders selected test cases', () => {
    // TODO: Implement this test when TestRunExecutionForm is updated
    // const mockTestCases = [
    //   { id: '1', title: 'Test Case 1' },
    //   { id: '2', title: 'Test Case 2' },
    // ];
    // render(<TestRunExecutionForm testCases={mockTestCases} />);
    // expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    // expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('allows updating test case status', () => {
    // TODO: Implement this test when status update functionality is added
    // const mockTestCases = [{ id: '1', title: 'Test Case 1' }];
    // render(<TestRunExecutionForm testCases={mockTestCases} />);
    // const statusSelect = screen.getByLabelText('Status');
    // fireEvent.change(statusSelect, { target: { value: 'PASSED' } });
    // expect(statusSelect.value).toBe('PASSED');
  });

  it('submits test run results', () => {
    // TODO: Implement this test when submit functionality is added
    // const mockOnSubmit = jest.fn();
    // const mockTestCases = [{ id: '1', title: 'Test Case 1' }];
    // render(<TestRunExecutionForm testCases={mockTestCases} onSubmit={mockOnSubmit} />);
    // fireEvent.click(screen.getByText('Submit Results'));
    // expect(mockOnSubmit).toHaveBeenCalled();
  });
});
