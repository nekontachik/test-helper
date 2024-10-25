import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestCaseForm } from '@/components/TestCaseForm';
import { TestCaseStatus, TestCasePriority } from '@/types';

const mockTestCase = {
  id: '1',
  title: 'Initial Test Case',
  description: 'Initial Description',
  steps: 'Step 1\nStep 2',
  expectedResult: 'Initial Expected Result',
  actualResult: 'Initial Actual Result',
  status: TestCaseStatus.DRAFT,
  priority: TestCasePriority.MEDIUM,
  projectId: 'project-1',
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TestCaseForm', () => {
  const defaultProps = {
    projectId: 'project-1',
    onSubmit: jest.fn(),
    isLoading: false,
  };

  it('renders correctly with test case data', () => {
    render(
      <ChakraProvider>
        <TestCaseForm
          {...defaultProps}
          testCase={mockTestCase}
        />
      </ChakraProvider>
    );

    expect(screen.getByLabelText('Title')).toHaveValue('Initial Test Case');
    expect(screen.getByLabelText('Description')).toHaveValue('Initial Description');
    expect(screen.getByLabelText('Steps')).toHaveValue('Step 1\nStep 2');
    expect(screen.getByLabelText('Expected Result')).toHaveValue('Initial Expected Result');
    expect(screen.getByLabelText('Actual Result')).toHaveValue('Initial Actual Result');
    expect(screen.getByLabelText('Status')).toHaveValue(TestCaseStatus.DRAFT);
    expect(screen.getByLabelText('Priority')).toHaveValue(TestCasePriority.MEDIUM);
  });

  it('submits form data correctly', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestCaseForm
          {...defaultProps}
          onSubmit={mockOnSubmit}
        />
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Test Case' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Description' },
    });
    fireEvent.change(screen.getByLabelText('Steps'), {
      target: { value: 'New Steps' },
    });
    fireEvent.change(screen.getByLabelText('Expected Result'), {
      target: { value: 'New Expected Result' },
    });
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: TestCaseStatus.ACTIVE },
    });
    fireEvent.change(screen.getByLabelText('Priority'), {
      target: { value: TestCasePriority.HIGH },
    });

    fireEvent.click(screen.getByText('Create Test Case'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Test Case',
        description: 'New Description',
        steps: 'New Steps',
        expectedResult: 'New Expected Result',
        actualResult: '',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
        projectId: 'project-1',
      });
    });
  });

  it('displays validation errors', async () => {
    render(
      <ChakraProvider>
        <TestCaseForm {...defaultProps} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Create Test Case'));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Steps are required')).toBeInTheDocument();
      expect(screen.getByText('Expected result is required')).toBeInTheDocument();
    });

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});
