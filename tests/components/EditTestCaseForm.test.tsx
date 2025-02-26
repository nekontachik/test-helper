import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditTestCaseForm } from '@/components/EditTestCaseForm';
import type { TestCase} from '@/types';
import { TestCaseStatus, TestCasePriority } from '@/types';

const mockTestCase: TestCase = {
  id: '1',
  title: 'Test Case 1',
  description: 'Description 1',
  steps: 'Step 1\nStep 2\nStep 3',
  expectedResult: 'Expected Result 1',
  actualResult: 'Actual Result 1',
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.HIGH,
  projectId: 'project1',
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
};

describe('EditTestCaseForm', () => {
  it('renders form with pre-filled values', () => {
    const mockOnSubmit = jest.fn();
    render(<EditTestCaseForm testCase={mockTestCase} onSubmit={mockOnSubmit} />);

    expect(screen.getByDisplayValue('Test Case 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Description 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Step 1\nStep 2\nStep 3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Expected Result 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Actual Result 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue(TestCaseStatus.ACTIVE)).toBeInTheDocument();
    expect(screen.getByDisplayValue(TestCasePriority.HIGH)).toBeInTheDocument();
  });

  it('calls onSubmit with updated data when form is submitted', () => {
    const mockOnSubmit = jest.fn();
    render(<EditTestCaseForm testCase={mockTestCase} onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByDisplayValue('Test Case 1'), { target: { value: 'Updated Test Case' } });
    fireEvent.click(screen.getByText('Update Test Case'));

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Updated Test Case',
      description: 'Description 1',
      steps: 'Step 1\nStep 2\nStep 3',
      expectedResult: 'Expected Result 1',
      actualResult: 'Actual Result 1',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
    }));
  });
});
