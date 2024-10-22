import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestCaseList } from '@/components/TestCaseList';
import { useTestCases } from '@/hooks/useTestCases';
import { TestCaseStatus, TestCasePriority } from '@/types';

// Mock the useTestCases hook
jest.mock('@/hooks/useTestCases');

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('TestCaseList', () => {
  const mockTestCases = [
    {
      id: '1',
      title: 'Test Case 1',
      description: 'Description 1',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
    },
    {
      id: '2',
      title: 'Test Case 2',
      description: 'Description 2',
      status: TestCaseStatus.INACTIVE,
      priority: TestCasePriority.LOW,
    },
  ];

  beforeEach(() => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: { items: mockTestCases, totalPages: 1 },
      isLoading: false,
      error: null,
    });
  });

  it('renders the test case list', () => {
    render(<TestCaseList projectId="project1" />);
    expect(screen.getByText('Test Cases')).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<TestCaseList projectId="project1" />);
    expect(screen.getByText('Loading test cases...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load test cases'),
    });
    render(<TestCaseList projectId="project1" />);
    expect(screen.getByText('Error loading test cases. Please try again.')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch test cases'),
    });

    render(<TestCaseList projectId="project1" />);

    expect(screen.getByText('Error loading test cases. Please try again.')).toBeInTheDocument();
  });

  it('handles empty test case list', async () => {
    (useTestCases as jest.Mock).mockReturnValue({
      data: { items: [], totalPages: 0, currentPage: 1 },
      isLoading: false,
      error: null,
    });

    render(<TestCaseList projectId="project1" />);

    expect(screen.getByText('No test cases found')).toBeInTheDocument();
  });

  it('creates a new test case', async () => {
    const mockCreateTestCase = jest.fn();
    (useTestCases as jest.Mock).mockReturnValue({
      data: { items: [], totalPages: 0, currentPage: 1 },
      isLoading: false,
      error: null,
      createTestCase: mockCreateTestCase,
    });

    render(<TestCaseList projectId="project1" />);

    fireEvent.click(screen.getByText('Create Test Case'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Test Case' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test description' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockCreateTestCase).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Test Case',
        description: 'Test description',
      }));
    });
  });

  it('filters test cases by status', () => {
    render(<TestCaseList projectId="project1" />);
    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    fireEvent.change(statusSelect, { target: { value: TestCaseStatus.ACTIVE } });
    expect(useTestCases).toHaveBeenCalledWith('project1', expect.objectContaining({ status: TestCaseStatus.ACTIVE }));
  });

  it('filters test cases by priority', () => {
    render(<TestCaseList projectId="project1" />);
    const prioritySelect = screen.getByRole('combobox', { name: /priority/i });
    fireEvent.change(prioritySelect, { target: { value: TestCasePriority.HIGH } });
    expect(useTestCases).toHaveBeenCalledWith('project1', expect.objectContaining({ priority: TestCasePriority.HIGH }));
  });
});
