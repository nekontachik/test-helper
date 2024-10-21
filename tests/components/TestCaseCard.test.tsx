import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestCaseCard } from '@/components/TestCaseCard';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

const mockTestCase: TestCase = {
  id: '1',
  title: 'Test Case 1',
  description: 'Description for Test Case 1',
  expectedResult: 'Expected Result 1',
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.HIGH,
  projectId: 'project1',
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TestCaseCard', () => {
  it('renders test case details correctly', () => {
    render(
      <ChakraProvider>
        <TestCaseCard testCase={mockTestCase} onViewDetails={() => {}} />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Description for Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('calls onViewDetails when View Details button is clicked', () => {
    const mockOnViewDetails = jest.fn();
    render(
      <ChakraProvider>
        <TestCaseCard testCase={mockTestCase} onViewDetails={mockOnViewDetails} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('View Details'));
    expect(mockOnViewDetails).toHaveBeenCalledWith('1');
  });
});
