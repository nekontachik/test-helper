import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTestCaseModal } from '@/components/CreateTestCaseModal';
import { TestCaseStatus, TestCasePriority } from '@/types';

describe('CreateTestCaseModal', () => {
  const mockOnClose = jest.fn();
  const mockOnCreateTestCase = jest.fn();

  const renderComponent = () =>
    render(
      <CreateTestCaseModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateTestCase={mockOnCreateTestCase}
        projectId="project1"
      />
    );

  it('renders the modal with form fields', () => {
    renderComponent();
    expect(screen.getByText('Create New Test Case')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Steps')).toBeInTheDocument();
    expect(screen.getByLabelText('Expected Result')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  });

  it('submits the form with correct data', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Test Case' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test description' } });
    fireEvent.change(screen.getByLabelText('Steps'), { target: { value: 'Step 1\nStep 2' } });
    fireEvent.change(screen.getByLabelText('Expected Result'), { target: { value: 'Expected result' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: TestCaseStatus.ACTIVE } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: TestCasePriority.HIGH } });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockOnCreateTestCase).toHaveBeenCalledWith({
        title: 'New Test Case',
        description: 'Test description',
        steps: 'Step 1\nStep 2',
        expectedResult: 'Expected result',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
        projectId: 'project1',
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes the modal when Cancel button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
