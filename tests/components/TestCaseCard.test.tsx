import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestCaseCard } from '@/components/TestCaseCard';
import type { TestCase} from '@/types';
import { TestCaseStatus, TestCasePriority } from '@/types';

const mockTestCase: TestCase = {
  id: '1',
  title: 'Test Case 1',
  description: 'This is a test case description',
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.HIGH,
  projectId: 'project1',
  steps: 'Step 1\nStep 2',
  expectedResult: 'Expected result',
  actualResult: 'Actual result',
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
};

describe('TestCaseCard', () => {
  it('renders test case information correctly', () => {
    render(<TestCaseCard testCase={mockTestCase} projectId="project1" />);

    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('This is a test case description')).toBeInTheDocument();
    expect(screen.getByText(TestCaseStatus.ACTIVE)).toBeInTheDocument();
    expect(screen.getByText(TestCasePriority.HIGH)).toBeInTheDocument();
  });

  it('contains edit and view details links', () => {
    render(<TestCaseCard testCase={mockTestCase} projectId="project1" />);

    const editLink = screen.getByRole('link', { name: /edit/i });
    expect(editLink).toHaveAttribute('href', '/projects/project1/test-cases/1/edit');

    const viewDetailsLink = screen.getByRole('link', { name: /view details/i });
    expect(viewDetailsLink).toHaveAttribute('href', '/projects/project1/test-cases/1');
  });
});
