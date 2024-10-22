import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestCaseVersionHistory } from '@/components/TestCaseVersionHistory';
import { useTestCaseVersions } from '@/hooks/useTestCase';
import { TestCaseVersion, TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/hooks/useTestCase');

const mockVersions: TestCaseVersion[] = [
  {
    id: '2',
    testCaseId: '1',
    versionNumber: 2,
    title: 'Updated Test Case',
    description: 'Updated description',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    expectedResult: 'Updated expected result',
    createdAt: new Date('2023-05-02'),
    updatedAt: new Date('2023-05-02'),
  },
  {
    id: '1',
    testCaseId: '1',
    versionNumber: 1,
    title: 'Original Test Case',
    description: 'Original description',
    status: TestCaseStatus.DRAFT,
    priority: TestCasePriority.MEDIUM,
    expectedResult: 'Original expected result',
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2023-05-01'),
  },
];

describe('TestCaseVersionHistory', () => {
  beforeEach(() => {
    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: mockVersions,
      isLoading: false,
      error: null,
    });
  });

  it('renders version history correctly', () => {
    const mockOnVersionRestore = jest.fn();
    render(
      <TestCaseVersionHistory
        projectId="project1"
        testCaseId="testcase1"
        onVersionRestore={mockOnVersionRestore}
      />
    );

    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Updated Test Case')).toBeInTheDocument();
    expect(screen.getByText('Original Test Case')).toBeInTheDocument();
  });

  it('calls onVersionRestore when restore button is clicked', async () => {
    const mockOnVersionRestore = jest.fn();
    render(
      <TestCaseVersionHistory
        projectId="project1"
        testCaseId="testcase1"
        onVersionRestore={mockOnVersionRestore}
      />
    );

    fireEvent.click(screen.getAllByText('Restore this version')[0]);
    await waitFor(() => {
      expect(mockOnVersionRestore).toHaveBeenCalledWith(2);
    });
  });

  it('shows loading state', () => {
    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <TestCaseVersionHistory
        projectId="project1"
        testCaseId="testcase1"
        onVersionRestore={jest.fn()}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load versions'),
    });

    render(
      <TestCaseVersionHistory
        projectId="project1"
        testCaseId="testcase1"
        onVersionRestore={jest.fn()}
      />
    );

    expect(screen.getByText('Error loading versions: Failed to load versions')).toBeInTheDocument();
  });
});
