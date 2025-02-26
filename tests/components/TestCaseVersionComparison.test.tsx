import { render, screen } from '@testing-library/react';
import TestCaseVersionComparison from '../TestCaseVersionComparison';
import type { TestCaseVersion} from '@/types';
import { TestCasePriority, TestCaseStatus } from '@/types';

describe('TestCaseVersionComparison', () => {
  const mockOldVersion: TestCaseVersion = {
    id: '1',
    versionNumber: 1,
    title: 'Old Title',
    description: 'Old Description',
    steps: ['Step 1', 'Step 2'],
    expectedResult: 'Old Result',
    priority: TestCasePriority.HIGH,
    status: TestCaseStatus.ACTIVE
  };

  const mockNewVersion: TestCaseVersion = {
    ...mockOldVersion,
    versionNumber: 2,
    title: 'New Title',
    description: 'New Description'
  };

  it('displays version differences correctly', () => {
    render(<TestCaseVersionComparison oldVersion={mockOldVersion} newVersion={mockNewVersion} />);
    
    expect(screen.getByText('Old Title')).toBeInTheDocument();
    expect(screen.getByText('New Title')).toBeInTheDocument();
  });
}); 