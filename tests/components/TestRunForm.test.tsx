import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestRunForm } from '@/components/TestRunForm';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

const mockTestCases: TestCase[] = [
  {
    id: '1',
    title: 'Test Case 1',
    description: 'Description 1',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    projectId: 'project1',
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
    expectedResult: 'Expected Result 2',
    steps: 'Step 1\nStep 2',
    actualResult: 'Actual Result 2',
    version: 1,
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
          projectId="project1"
          isSubmitting={false}
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
          projectId="project1"
          isSubmitting={false}
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
