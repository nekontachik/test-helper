import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestCaseForm } from '../../components/TestCaseForm';
import { TestCaseStatus, TestCasePriority } from '../../models/types';

describe('TestCaseForm', () => {
  it('renders correctly with initial data', () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestCaseForm
          onSubmit={mockOnSubmit}
          initialData={{
            title: 'Initial Test Case',
            description: 'Initial Description',
            expectedResult: 'Initial Expected Result',
            status: TestCaseStatus.DRAFT,
            priority: TestCasePriority.MEDIUM,
          }}
        />
      </ChakraProvider>
    );

    expect(screen.getByLabelText('Title')).toHaveValue('Initial Test Case');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Initial Description'
    );
    expect(screen.getByLabelText('Expected Result')).toHaveValue(
      'Initial Expected Result'
    );
    expect(screen.getByLabelText('Status')).toHaveValue(TestCaseStatus.DRAFT);
    expect(screen.getByLabelText('Priority')).toHaveValue(
      TestCasePriority.MEDIUM
    );
  });

  it('submits form data correctly', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestCaseForm onSubmit={mockOnSubmit} />
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Test Case' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Description' },
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

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Test Case',
        description: 'New Description',
        expectedResult: 'New Expected Result',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
      });
    });
  });

  it('displays validation errors', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestCaseForm onSubmit={mockOnSubmit} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(
        screen.getByText('Expected Result is required')
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
