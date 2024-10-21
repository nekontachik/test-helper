import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { CreateTestCaseModal } from '@/components/CreateTestCaseModal';
import { TestCaseStatus, TestCasePriority } from '@/types';
import  apiClient  from '@/lib/apiClient';

jest.mock('@/lib/apiClient');

describe('CreateTestCaseModal', () => {
  it('renders modal when isOpen is true', () => {
    render(
      <ChakraProvider>
        <CreateTestCaseModal 
          isOpen={true} 
          onClose={jest.fn()} 
          onSubmit={jest.fn()} 
          projectId="project1" 
        />
      </ChakraProvider>
    );

    expect(screen.getByText('Create New Test Case')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when Create button is clicked', async () => {
    const mockOnSubmit = jest.fn();
    const mockCreateTestCase = jest.fn().mockResolvedValue({
      id: '1',
      title: 'New Test Case',
      description: 'New Description',
      expectedResult: 'New Expected Result',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
      projectId: 'project1',
    });

    (apiClient.createTestCase as jest.Mock) = mockCreateTestCase;

    render(
      <ChakraProvider>
        <CreateTestCaseModal 
          isOpen={true} 
          onClose={jest.fn()} 
          onSubmit={mockOnSubmit} 
          projectId="project1"
        />
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Test Case' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText('Expected Result'), { target: { value: 'New Expected Result' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: TestCaseStatus.ACTIVE } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: TestCasePriority.HIGH } });

    fireEvent.click(screen.getByText('Create'));

    expect(mockCreateTestCase).toHaveBeenCalledWith('project1', {
      title: 'New Test Case',
      description: 'New Description',
      expectedResult: 'New Expected Result',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <ChakraProvider>
        <CreateTestCaseModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSubmit={jest.fn()} 
          projectId="project1"
        />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
