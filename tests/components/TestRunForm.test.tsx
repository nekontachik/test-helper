import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestRunForm } from '../../components/TestRunForm';
import { TestCase, TestSuite } from '../../lib/types';

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

const mockTestSuites: TestSuite[] = [
  {
    id: '1',
    name: 'Test Suite 1',
    description: 'Description 1',
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Test Suite 2',
    description: 'Description 2',
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('TestRunForm', () => {
  it('renders correctly', () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestRunForm
          onSubmit={mockOnSubmit}
          testCases={mockTestCases}
          testSuites={mockTestSuites}
        />
      </ChakraProvider>
    );

    expect(screen.getByLabelText('Test Run Name')).toBeInTheDocument();
    expect(screen.getByText('Create Test Run')).toBeInTheDocument();
  });

  it('submits form data correctly', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <TestRunForm
          onSubmit={mockOnSubmit}
          testCases={mockTestCases}
          testSuites={mockTestSuites}
        />
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText('Test Run Name'), {
      target: { value: 'New Test Run' },
    });
    fireEvent.click(screen.getByText('Create Test Run'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Test Run',
        testCaseIds: [],
      });
    });
  });
});
