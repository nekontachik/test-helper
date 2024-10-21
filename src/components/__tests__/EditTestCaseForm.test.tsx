import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditTestCaseForm } from '../EditTestCaseForm';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

describe('EditTestCaseForm', () => {
  const mockTestCase: TestCase = {
    id: '1',
    title: 'Test Case 1',
    description: 'Test case description',
    expectedResult: 'Expected result',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    projectId: 'project1',
    version: 1,
    createdAt: '2023-01-01T00:00:00Z', // Use ISO string format
    updatedAt: '2023-01-01T00:00:00Z', // Use ISO string format
  };

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with pre-populated data', () => {
    render(<EditTestCaseForm testCase={mockTestCase} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText('Title')).toHaveValue('Test Case 1');
    expect(screen.getByLabelText('Description')).toHaveValue('Test case description');
    expect(screen.getByLabelText('Expected Result')).toHaveValue('Expected result');
    expect(screen.getByLabelText('Status')).toHaveValue(TestCaseStatus.ACTIVE);
    expect(screen.getByLabelText('Priority')).toHaveValue(TestCasePriority.HIGH);
  });

  it('calls onSubmit with updated data when form is submitted', async () => {
    render(<EditTestCaseForm testCase={mockTestCase} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Test Case' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated description' } });
    fireEvent.change(screen.getByLabelText('Expected Result'), { target: { value: 'Updated expected result' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: TestCaseStatus.INACTIVE } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: TestCasePriority.LOW } });

    fireEvent.click(screen.getByText('Update Test Case (Create New Version)'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Updated Test Case',
        description: 'Updated description',
        expectedResult: 'Updated expected result',
        status: TestCaseStatus.INACTIVE,
        priority: TestCasePriority.LOW,
        projectId: 'project1',
      });
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(<EditTestCaseForm testCase={mockTestCase} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('displays the correct version number', () => {
    render(<EditTestCaseForm testCase={mockTestCase} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByText('Editing Version: 1')).toBeInTheDocument();
  });

  it('displays the correct button text', () => {
    render(<EditTestCaseForm testCase={mockTestCase} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByText('Update Test Case (Create New Version)')).toBeInTheDocument();
  });
});
