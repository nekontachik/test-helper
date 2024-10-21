import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestCaseDetails } from '../TestCaseDetails';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';
import { useTestCaseVersions } from '@/hooks/useTestCase'; // Import the hook

// Mock the useTestCaseVersions hook
jest.mock('@/hooks/useTestCase', () => ({
  useTestCaseVersions: jest.fn(),
}));

describe('TestCaseDetails', () => {
  const mockTestCase: TestCase = {
    id: '1',
    title: 'Test Case 1',
    description: 'This is a detailed test case',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    projectId: 'project1',
    version: 2,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    expectedResult: 'Expected result for the test case',
  };

  const projectId = 'project1';

  beforeEach(() => {
    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
  });

  it('renders test case details correctly', () => {
    render(<TestCaseDetails testCase={mockTestCase} projectId={projectId} />);
    
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('This is a detailed test case')).toBeInTheDocument();
    expect(screen.getByText(TestCaseStatus.ACTIVE)).toBeInTheDocument();
    expect(screen.getByText(TestCasePriority.HIGH)).toBeInTheDocument();
    expect(screen.getByText('Expected result for the test case')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Version
    expect(screen.getByText('1/1/2023, 12:00:00 AM')).toBeInTheDocument(); // CreatedAt
    expect(screen.getByText('1/2/2023, 12:00:00 AM')).toBeInTheDocument(); // UpdatedAt
  });

  it('applies correct color scheme to status and priority badges', () => {
    render(<TestCaseDetails testCase={mockTestCase} projectId={projectId} />);
    const statusBadge = screen.getByText(TestCaseStatus.ACTIVE);
    const priorityBadge = screen.getByText(TestCasePriority.HIGH);

    expect(statusBadge).toHaveClass('chakra-badge');
    expect(statusBadge).toHaveStyle('background-color: var(--chakra-colors-green-500)');
    expect(priorityBadge).toHaveClass('chakra-badge');
    expect(priorityBadge).toHaveStyle('background-color: var(--chakra-colors-red-500)');
  });

  it('renders version history correctly', () => {
    const mockVersions = [
      {
        id: 'v1',
        testCaseId: '1',
        versionNumber: 1,
        title: 'Old Title',
        description: 'Old description',
        status: TestCaseStatus.DRAFT,
        priority: TestCasePriority.LOW,
        expectedResult: 'Old expected result',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'v2',
        testCaseId: '1',
        versionNumber: 2,
        title: 'Test Case 1',
        description: 'This is a detailed test case',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
        expectedResult: 'Expected result for the test case',
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      },
    ];

    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: mockVersions,
      isLoading: false,
      error: null,
    });

    render(<TestCaseDetails testCase={mockTestCase} projectId={projectId} />);

    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Old Title')).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText(TestCaseStatus.DRAFT)).toBeInTheDocument();
    expect(screen.getByText(TestCaseStatus.ACTIVE)).toBeInTheDocument();
    expect(screen.getByText(TestCasePriority.LOW)).toBeInTheDocument();
    expect(screen.getByText(TestCasePriority.HIGH)).toBeInTheDocument();
    expect(screen.getAllByText('1/1/2023, 12:00:00 AM')[0]).toBeInTheDocument();
    expect(screen.getAllByText('1/2/2023, 12:00:00 AM')[0]).toBeInTheDocument();
  });
});
