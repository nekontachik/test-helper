import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateTestCaseModal } from '@/components/CreateTestCaseModal';
import apiClient from '@/lib/apiClient';
import { TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/lib/apiClient', () => ({
  __esModule: true,
  default: {
    createTestCase: jest.fn(),
  },
}));

const queryClient = new QueryClient();

describe('Create Test Case Flow', () => {
  it('creates a test case successfully', async () => {
    const mockOnClose = jest.fn();
    const mockOnCreateTestCase = jest.fn();
    const mockTestCase = {
      title: 'New Test Case',
      description: 'Test Case Description',
      expectedResult: 'Expected Result',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
    };

    (apiClient.createTestCase as jest.Mock).mockResolvedValue(mockTestCase);

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <CreateTestCaseModal 
            isOpen={true} 
            onClose={mockOnClose} 
            projectId="project-1"
            onCreateTestCase={mockOnCreateTestCase}
          />
        </QueryClientProvider>
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Test Case' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Case Description' },
    });
    fireEvent.click(screen.getByText(/create/i));

    await waitFor(() => {
      expect(mockOnCreateTestCase).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles validation errors', async () => {
    const mockOnClose = jest.fn();
    const mockOnCreateTestCase = jest.fn();

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <CreateTestCaseModal 
            isOpen={true} 
            onClose={mockOnClose} 
            projectId="project-1"
            onCreateTestCase={mockOnCreateTestCase}
          />
        </QueryClientProvider>
      </ChakraProvider>
    );

    // Try to submit without required fields
    fireEvent.click(screen.getByText(/create/i));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(mockOnCreateTestCase).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('handles API errors', async () => {
    const mockOnClose = jest.fn();
    const mockOnCreateTestCase = jest.fn();
    const mockError = new Error('API Error');

    (apiClient.createTestCase as jest.Mock).mockRejectedValue(mockError);

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <CreateTestCaseModal 
            isOpen={true} 
            onClose={mockOnClose} 
            projectId="project-1"
            onCreateTestCase={mockOnCreateTestCase}
          />
        </QueryClientProvider>
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Test Case' },
    });
    fireEvent.click(screen.getByText(/create/i));

    await waitFor(() => {
      expect(screen.getByText(/error creating test case/i)).toBeInTheDocument();
      expect(mockOnCreateTestCase).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
