import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestCaseCard } from '../TestCaseCard';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

describe('TestCaseCard', () => {
  const mockTestCase: TestCase = {
    id: '1',
    title: 'Test Case 1',
    description: 'This is a test case',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    projectId: 'project1',
    version: 1,
    createdAt: '2023-01-01T00:00:00Z', // Changed to ISO string format
    updatedAt: '2023-01-01T00:00:00Z', // Changed to ISO string format
    expectedResult: 'Expected result',
  };

  it('renders test case information correctly', () => {
    render(<TestCaseCard testCase={mockTestCase} />);
    
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('This is a test case')).toBeInTheDocument();
    expect(screen.getByText(TestCaseStatus.ACTIVE)).toBeInTheDocument();
    expect(screen.getByText(TestCasePriority.HIGH)).toBeInTheDocument();
  });

  it('applies correct color scheme to status badge', () => {
    render(<TestCaseCard testCase={mockTestCase} />);
    const statusBadge = screen.getByText(TestCaseStatus.ACTIVE);
    expect(statusBadge).toHaveClass('chakra-badge');
    expect(statusBadge).toHaveStyle('background-color: var(--chakra-colors-green-500)');
  });

  it('applies correct color scheme to priority badge', () => {
    render(<TestCaseCard testCase={mockTestCase} />);
    const priorityBadge = screen.getByText(TestCasePriority.HIGH);
    expect(priorityBadge).toHaveClass('chakra-badge');
    expect(priorityBadge).toHaveStyle('background-color: var(--chakra-colors-red-500)');
  });

  it('applies correct color scheme to medium priority badge', () => {
    const mediumPriorityTestCase = { ...mockTestCase, priority: TestCasePriority.MEDIUM };
    render(<TestCaseCard testCase={mediumPriorityTestCase} />);
    const priorityBadge = screen.getByText(TestCasePriority.MEDIUM);
    expect(priorityBadge).toHaveStyle('background-color: var(--chakra-colors-yellow-500)');
  });

  it('applies correct color scheme to low priority badge', () => {
    const lowPriorityTestCase = { ...mockTestCase, priority: TestCasePriority.LOW };
    render(<TestCaseCard testCase={lowPriorityTestCase} />);
    const priorityBadge = screen.getByText(TestCasePriority.LOW);
    expect(priorityBadge).toHaveStyle('background-color: var(--chakra-colors-green-500)');
  });
});