import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestCaseDetails from '@/components/TestCaseDetails';  // Changed to default import
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
  description: 'Test Description',
  expectedResult: 'Expected Result',
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.HIGH,
  projectId: '1',
  version: 1,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  steps: 'Step 1\nStep 2',
  actualResult: 'Actual Result'
};

describe('TestCaseDetails', () => {
  beforeEach(() => {
    (useRestoreTestCaseVersion as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });
  });

  it('renders test case details', () => {
    render(<TestCaseDetails testCaseId={mockTestCase.id} projectId="project1" />);
    
    expect(screen.getByText(mockTestCase.title)).toBeInTheDocument();
    expect(screen.getByText(mockTestCase.description!)).toBeInTheDocument();
    expect(screen.getByText(mockTestCase.expectedResult!)).toBeInTheDocument();
  });
});
