import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestSuiteForm } from '../../components/TestSuiteForm';
import { TestCase } from '../../models/types';

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
    status: 'DRAFT',
    priority: 'MEDIUM',
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expectedResult: 'Expected Result 2',
    testSuiteId: null,
  },
];

describe('TestSuiteForm', () => {
  it('renders correctly with initial data', () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestSuiteForm
          onSubmit={mockOnSubmit}
          testCases={mockTestCases}
          initialData={{
            name: 'Initial Test Suite',
            description: 'Initial Description',
            testCaseIds: ['1'],
          }}
        />
      </ChakraProvider>
    );

    expect(screen.getByLabelText('Name')).toHaveValue('Initial Test Suite');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Initial Description'
    );
    expect(screen.getByLabelText('Test Cases')).toHaveValue(['1']);
  });

  it('submits form data correctly', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestSuiteForm onSubmit={mockOnSubmit} testCases={mockTestCases} />
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'New Test Suite' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Description' },
    });
    fireEvent.select(screen.getByLabelText('Test Cases'), {
      target: { value: '2' },
    });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Test Suite',
        description: 'New Description',
        testCaseIds: ['2'],
      });
    });
  });

  it('displays validation errors', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestSuiteForm onSubmit={mockOnSubmit} testCases={mockTestCases} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});