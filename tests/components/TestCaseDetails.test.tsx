import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestCaseDetails } from '@/components/TestCaseDetails';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';
import { useRestoreTestCaseVersion } from '@/hooks/useTestCase';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/hooks/useTestCase', () => ({
  useRestoreTestCaseVersion: jest.fn(),
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

describe('TestCaseDetails', () => {
  beforeEach(() => {
    (useRestoreTestCaseVersion as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });
  });

  it('renders the test case details', () => {
    render(<TestCaseDetails testCase={mockTestCase} projectId="project1" />);
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Expected Result 1')).toBeInTheDocument();
    expect(screen.getByText('Actual Result 1')).toBeInTheDocument();
    expect(screen.getByText(TestCaseStatus.ACTIVE)).toBeInTheDocument();
    expect(screen.getByText(TestCasePriority.HIGH)).toBeInTheDocument();
  });

  it('navigates to edit page when Edit button is clicked', () => {
    const pushMock = jest.fn();
    (require('next/navigation') as any).useRouter.mockReturnValue({ push: pushMock });

    render(<TestCaseDetails testCase={mockTestCase} projectId="project1" />);
    fireEvent.click(screen.getByText('Edit Test Case'));
    expect(pushMock).toHaveBeenCalledWith('/projects/project1/test-cases/1/edit');
  });

  it('calls restoreVersion when a version is restored', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    (useRestoreTestCaseVersion as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    render(<TestCaseDetails testCase={mockTestCase} projectId="project1" />);
    
    // Simulate restoring a version
    fireEvent.click(screen.getByText('Restore this version'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });
});
