import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestCaseItem } from '@/components/TestCaseItem';
import { TestCase } from '@/models/testCase';

describe('TestCaseItem', () => {
  const testCase: TestCase = {
    id: '1',
    title: 'Test Case 1',
    status: 'Pending',
    priority: 'medium',
    projectId: 'project1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders correctly', () => {
    render(<TestCaseItem testCase={testCase} />);

    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
});
