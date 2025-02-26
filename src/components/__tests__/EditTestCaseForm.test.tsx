import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { EditTestCaseForm } from '../EditTestCaseForm';
import type { TestCase} from '@/types';
import { TestCaseStatus, TestCasePriority } from '@/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockTestCase: TestCase = {
  id: '1',
  title: 'Test Case 1',
  description: 'Description 1',
  steps: 'Step 1\nStep 2\nStep 3',
  expectedResult: 'Expected Result 1',
  actualResult: 'Actual Result 1',
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.HIGH,
  projectId: 'project1',
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
};

describe('EditTestCaseForm', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  const renderComponent = (props = {}): ReturnType<typeof render> => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <EditTestCaseForm
            testCase={mockTestCase}
            onSubmit={jest.fn()}
            isLoading={false}
            {...props}
          />
        </ChakraProvider>
      </QueryClientProvider>
    );
  };

  it('renders form with pre-filled values', () => {
    renderComponent();

    expect(screen.getByDisplayValue('Test Case 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Description 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Step 1\nStep 2\nStep 3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Expected Result 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Actual Result 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue(TestCaseStatus.ACTIVE)).toBeInTheDocument();
    expect(screen.getByDisplayValue(TestCasePriority.HIGH)).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    const mockOnSubmit = jest.fn();
    renderComponent({ onSubmit: mockOnSubmit });

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Updated Test Case' }
    });

    fireEvent.click(screen.getByText(/update test case/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        ...mockTestCase,
        title: 'Updated Test Case'
      });
    });
  });

  it('shows validation errors', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/update test case/i));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('handles loading state correctly', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update test case/i })).toBeDisabled();
  });

  it('displays the correct version number', () => {
    renderComponent();
    expect(screen.getByText('Editing Version: 1')).toBeInTheDocument();
  });

  it('displays the correct button text', () => {
    renderComponent();
    expect(screen.getByText('Update Test Case (Create New Version)')).toBeInTheDocument();
  });
});
