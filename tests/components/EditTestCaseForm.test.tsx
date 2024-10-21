import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { EditTestCaseForm } from '@/components/EditTestCaseForm';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

const mockTestCase: TestCase = {
  id: '1',
  title: 'Test Case 1',
  description: 'Test case description',
  expectedResult: 'Expected result',
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.HIGH,
  projectId: 'project1',
  version: 1,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

describe('EditTestCaseForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with pre-populated data', () => {
    render(
      <ChakraProvider>
        <EditTestCaseForm
          testCase={mockTestCase}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </ChakraProvider>
    );

    expect(screen.getByLabelText('Title')).toHaveValue('Test Case 1');
    expect(screen.getByLabelText('Description')).toHaveValue('Test case description');
    expect(screen.getByLabelText('Expected Result')).toHaveValue('Expected result');
    expect(screen.getByLabelText('Status')).toHaveValue(TestCaseStatus.ACTIVE);
    expect(screen.getByLabelText('Priority')).toHaveValue(TestCasePriority.HIGH);
  });

  it('calls onSubmit with updated data when form is submitted', async () => {
    render(
      <ChakraProvider>
        <EditTestCaseForm
          testCase={mockTestCase}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Test Case' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByLabelText('Expected Result'), { target: { value: 'Updated Expected Result' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: TestCaseStatus.DRAFT } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: TestCasePriority.MEDIUM } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Updated Test Case',
      description: 'Updated Description',
      expectedResult: 'Updated Expected Result',
      status: TestCaseStatus.DRAFT,
      priority: TestCasePriority.MEDIUM,
    }));
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <ChakraProvider>
        <EditTestCaseForm
          testCase={mockTestCase}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
