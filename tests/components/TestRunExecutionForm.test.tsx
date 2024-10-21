import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestRunExecutionForm } from '../../components/TestRunExecutionForm';
import { TestCase, TestCaseResultStatus } from '../../models/types';

const mockTestCases: TestCase[] = [
  {
    id: '1',
    title: 'Test Case 1',
    description: 'Description 1',
    status: 'ACTIVE',
    priority: 'HIGH',
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expectedResult: 'Expected Result 1',
    testSuiteId: null,
  },
  {
    id: '2',
    title: 'Test Case 2',
    description: 'Description 2',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expectedResult: 'Expected Result 2',
    testSuiteId: null,
  },
];

describe('TestRunExecutionForm', () => {
  it('renders test cases correctly', () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestRunExecutionForm
          testCases={mockTestCases}
          onSubmit={mockOnSubmit}
        />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('submits form data correctly', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestRunExecutionForm
          testCases={mockTestCases}
          onSubmit={mockOnSubmit}
        />
      </ChakraProvider>
    );

    fireEvent.change(screen.getAllByLabelText('Status')[0], {
      target: { value: TestCaseResultStatus.PASSED },
    });
    fireEvent.change(screen.getAllByLabelText('Notes')[0], {
      target: { value: 'Test passed successfully' },
    });

    fireEvent.click(screen.getByText('Submit Results'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        {
          testCaseId: '1',
          status: TestCaseResultStatus.PASSED,
          notes: 'Test passed successfully',
        },
        {
          testCaseId: '2',
          status: TestCaseResultStatus.NOT_EXECUTED,
          notes: '',
        },
      ]);
    });
  });

  it('validates required fields', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestRunExecutionForm
          testCases={mockTestCases}
          onSubmit={mockOnSubmit}
        />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Submit Results'));

    await waitFor(() => {
      expect(
        screen.getByText('Please select a status for all test cases')
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows skipping test cases', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestRunExecutionForm
          testCases={mockTestCases}
          onSubmit={mockOnSubmit}
        />
      </ChakraProvider>
    );

    fireEvent.change(screen.getAllByLabelText('Status')[0], {
      target: { value: TestCaseResultStatus.SKIPPED },
    });
    fireEvent.change(screen.getAllByLabelText('Notes')[0], {
      target: { value: 'Skipped due to environment issues' },
    });

    fireEvent.click(screen.getByText('Submit Results'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        {
          testCaseId: '1',
          status: TestCaseResultStatus.SKIPPED,
          notes: 'Skipped due to environment issues',
        },
        {
          testCaseId: '2',
          status: TestCaseResultStatus.NOT_EXECUTED,
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
