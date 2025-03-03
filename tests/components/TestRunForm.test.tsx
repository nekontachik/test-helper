import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestRunForm } from '../TestRunForm';
import type { TestCase} from '@/types';
import { TestCaseStatus, TestCasePriority } from '@/types';

describe('TestRunForm', () => {
  const mockTestCases: TestCase[] = [
    { 
      id: '1', 
      title: 'Test Case 1', 
      status: TestCaseStatus.ACTIVE, 
      priority: TestCasePriority.HIGH, 
      projectId: 'project1', 
      description: 'Description 1', 
      expectedResult: 'Expected 1',
      steps: 'Step 1\nStep 2',  // Added missing steps
      actualResult: 'Actual Result 1',  // Added missing actualResult
      version: 1, 
      createdAt: '2023-01-01T00:00:00Z', 
      updatedAt: '2023-01-01T00:00:00Z' 
    },
    { 
      id: '2', 
      title: 'Test Case 2', 
      status: TestCaseStatus.ACTIVE, 
      priority: TestCasePriority.MEDIUM, 
      projectId: 'project1', 
      description: 'Description 2', 
      expectedResult: 'Expected 2',
      steps: 'Step 1\nStep 2',  // Added missing steps
      actualResult: 'Actual Result 2',  // Added missing actualResult
      version: 1, 
      createdAt: '2023-01-02T00:00:00Z', 
      updatedAt: '2023-01-02T00:00:00Z' 
    },
  ];

  const mockOnSubmit = jest.fn();

  const defaultProps = {
    testCases: mockTestCases,
    onSubmit: mockOnSubmit,
    projectId: 'project1',
    isSubmitting: false,
  };

  it('renders form correctly', () => {
    render(<TestRunForm {...defaultProps} />);
    expect(screen.getByLabelText('Test Run Name')).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('submits form with selected test cases', async () => {
    render(<TestRunForm {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText('Test Run Name'), { target: { value: 'New Test Run' } });
    fireEvent.click(screen.getByLabelText('Test Case 1'));
    fireEvent.click(screen.getByText('Create Test Run'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Test Run',
        testCaseIds: ['1'],
        projectId: 'project1',
      });
    });
  });

  it('shows validation error when no name is provided', async () => {
    render(<TestRunForm {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Create Test Run'));

    await waitFor(() => {
      expect(screen.getByText('Test run name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when no test cases are selected', async () => {
    render(<TestRunForm {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText('Test Run Name'), { target: { value: 'New Test Run' } });
    fireEvent.click(screen.getByText('Create Test Run'));

    await waitFor(() => {
      expect(screen.getByText('At least one test case must be selected')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
