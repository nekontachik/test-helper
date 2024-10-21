import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { CreateTestCaseModal } from '@/components/CreateTestCaseModal';
import { TestCaseStatus, TestCasePriority } from '@/types';

describe('CreateTestCaseModal', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();
  const projectId = 'project1';

  const renderComponent = (props = {}) => {
    render(
      <ChakraProvider>
        <CreateTestCaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          projectId={projectId}
          {...props}
        />
      </ChakraProvider>
    );
  };

  it('renders modal when isOpen is true', () => {
    renderComponent();
    expect(screen.getByText('Create New Test Case')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when Create button is clicked', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Test Case' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText('Expected Result'), { target: { value: 'New Expected Result' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: TestCaseStatus.ACTIVE } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: TestCasePriority.HIGH } });

    fireEvent.click(screen.getByText('Create'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Test Case',
      description: 'New Description',
      expectedResult: 'New Expected Result',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
      projectId: projectId,
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call onSubmit when form is empty', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Create'));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
