import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestCaseVersionHistory } from '@/components/TestCaseVersionHistory';
import { useTestCaseVersions } from '@/hooks/useTestCase';
import { TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/hooks/useTestCase');

const mockVersions = [
  {
    id: '2',
    versionNumber: 2,
    title: 'Updated Test Case',
    description: 'Updated description',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    expectedResult: 'Updated expected result',
    createdAt: '2023-05-02',
  },
  {
    id: '1',
    versionNumber: 1,
    title: 'Original Test Case',
    description: 'Original description',
    status: TestCaseStatus.DRAFT,
    priority: TestCasePriority.MEDIUM,
    expectedResult: 'Original expected result',
    createdAt: '2023-05-01',
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
    const mockOnVersionSelect = jest.fn();
    render(
      <TestCaseVersionHistory
        versions={mockVersions}
        onVersionSelect={mockOnVersionSelect}
        currentVersion={2}
      />
    );

    expect(screen.getByText('Version 2')).toBeInTheDocument();
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Updated Test Case')).toBeInTheDocument();
    expect(screen.getByText('Original Test Case')).toBeInTheDocument();
  });

  it('calls onVersionSelect when version is clicked', async () => {
    const mockOnVersionSelect = jest.fn();
    render(
      <TestCaseVersionHistory
        versions={mockVersions}
        onVersionSelect={mockOnVersionSelect}
        currentVersion={1}
      />
    );

    fireEvent.click(screen.getByText('Version 2'));
    expect(mockOnVersionSelect).toHaveBeenCalledWith(mockVersions[0]);
  });

  it('shows loading state', () => {
    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <TestCaseVersionHistory
        versions={[]}
        currentVersion={1}
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
        versions={[]}
        currentVersion={1}
      />
    );

    expect(screen.getByText('Error loading versions: Failed to load versions')).toBeInTheDocument();
  });
});
