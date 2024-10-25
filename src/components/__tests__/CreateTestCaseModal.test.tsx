import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { CreateTestCaseModal } from '@/components/CreateTestCaseModal';
import { TestCaseStatus, TestCasePriority } from '@/types';

describe('CreateTestCaseModal', () => {
  const mockOnCreateTestCase = jest.fn();  // Changed from mockOnCreate
  const mockOnClose = jest.fn();
  const projectId = 'project1';

  const renderComponent = (props = {}) => {
    render(
      <ChakraProvider>
        <CreateTestCaseModal
          isOpen={true}
          onClose={mockOnClose}
          onCreateTestCase={mockOnCreateTestCase}  // Changed from onCreate to onCreateTestCase
          projectId={projectId}
          {...props}
        />
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    renderComponent();
    expect(screen.getByText('Create New Test Case')).toBeInTheDocument();
  });

  it('calls onCreateTestCase with form data when Create button is clicked', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Test Case' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText('Steps'), { target: { value: 'Step 1\nStep 2' } });
    fireEvent.change(screen.getByLabelText('Expected Result'), { target: { value: 'New Expected Result' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: TestCaseStatus.ACTIVE } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: TestCasePriority.HIGH } });

    fireEvent.click(screen.getByText('Create'));

    expect(mockOnCreateTestCase).toHaveBeenCalledWith({
      title: 'New Test Case',
      description: 'New Description',
      steps: 'Step 1\nStep 2',
      expectedResult: 'New Expected Result',
      actualResult: '',
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

  it('does not call onCreateTestCase when form is empty', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Create'));
    expect(mockOnCreateTestCase).not.toHaveBeenCalled();
  });

  it('shows validation errors for required fields', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Create'));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Steps are required')).toBeInTheDocument();
    expect(screen.getByText('Expected result is required')).toBeInTheDocument();
  });
});
