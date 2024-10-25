import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { useTestCase, useUpdateTestCase } from '@/hooks/useTestCase';
import EditTestCasePage from '@/app/projects/[projectId]/test-cases/[testCaseId]/edit/page';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useTestCase', () => ({
  useTestCase: jest.fn(),
  useUpdateTestCase: jest.fn(),
}));

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

describe('EditTestCasePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ projectId: 'project1', testCaseId: '1' });
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useTestCase as jest.Mock).mockReturnValue({ data: mockTestCase, isLoading: false, error: null });
    (useUpdateTestCase as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() });
  });

  it('renders the edit test case form', () => {
    render(<EditTestCasePage />);
    expect(screen.getByText('Edit Test Case')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Case 1')).toBeInTheDocument();
  });

  it('updates the test case and redirects on successful submission', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    (useUpdateTestCase as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(<EditTestCasePage />);

    fireEvent.change(screen.getByDisplayValue('Test Case 1'), { target: { value: 'Updated Test Case' } });
    fireEvent.click(screen.getByText('Update Test Case'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        projectId: 'project1',
        testCaseId: '1',
        testCase: expect.objectContaining({ title: 'Updated Test Case' }),
      });
      expect(mockPush).toHaveBeenCalledWith('/projects/project1/test-cases/1');
    });
  });

  it('displays an error message on submission failure', async () => {
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Update failed'));
    (useUpdateTestCase as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });

    render(<EditTestCasePage />);

    fireEvent.click(screen.getByText('Update Test Case'));

    await waitFor(() => {
      expect(screen.getByText('Error updating test case')).toBeInTheDocument();
    });
  });
});
