import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestCaseList } from '../TestCaseList';
import { useTestCases } from '@/hooks/useTestCases';
import { TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/hooks/useTestCases');

describe('TestCaseList', () => {
  const mockTestCases = [
    { id: '1', title: 'Test Case 1', status: TestCaseStatus.ACTIVE, priority: TestCasePriority.HIGH },
    { id: '2', title: 'Test Case 2', status: TestCaseStatus.INACTIVE, priority: TestCasePriority.LOW },
    { id: '3', title: 'Test Case 3', status: TestCaseStatus.ACTIVE, priority: TestCasePriority.MEDIUM },
  ];

  beforeEach(() => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: mockTestCases,
      isLoading: false,
      error: null,
    });
  });

  it('renders all test cases when no filter is applied', () => {
    render(<TestCaseList projectId="1" />);
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
    expect(screen.getByText('Test Case 3')).toBeInTheDocument();
  });

  it('filters test cases by status', () => {
    render(<TestCaseList projectId="1" />);
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: TestCaseStatus.ACTIVE } });
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 3')).toBeInTheDocument();
    expect(screen.queryByText('Test Case 2')).not.toBeInTheDocument();
  });

  it('filters test cases by priority', () => {
    render(<TestCaseList projectId="1" />);
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: TestCasePriority.HIGH } });
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Case 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Case 3')).not.toBeInTheDocument();
  });

  it('combines status and priority filters', () => {
    render(<TestCaseList projectId="1" />);
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: TestCaseStatus.ACTIVE } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: TestCasePriority.HIGH } });
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Case 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Case 3')).not.toBeInTheDocument();
  });

  it('displays loading state', () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<TestCaseList projectId="1" />);
    expect(screen.getByText('Loading test cases...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load test cases'),
    });
    render(<TestCaseList projectId="1" />);
    expect(screen.getByText('Error loading test cases: Failed to load test cases')).toBeInTheDocument();
  });

  it('displays "No test cases found" message when there are no test cases', () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<TestCaseList projectId="1" />);
    expect(screen.getByText('No test cases found for this project.')).toBeInTheDocument();
  });
});
