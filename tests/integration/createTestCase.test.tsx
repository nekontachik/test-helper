import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateTestCaseModal } from '@/components/CreateTestCaseModal';
import { apiClient } from '@/lib/apiClient';

jest.mock('@/lib/apiClient');

const queryClient = new QueryClient();

describe('Create Test Case Flow', () => {
  it('creates a test case successfully', async () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <CreateTestCaseModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
        </QueryClientProvider>
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Test Case' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Case Description' },
    });
    fireEvent.change(screen.getByLabelText(/expected result/i), {
      target: { value: 'Expected Result' },
    });
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'ACTIVE' },
    });
    fireEvent.change(screen.getByLabelText(/priority/i), {
      target: { value: 'HIGH' },
    });

    fireEvent.click(screen.getByText(/create/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Test Case',
        description: 'Test Case Description',
        expectedResult: 'Expected Result',
        status: 'ACTIVE',
        priority: 'HIGH',
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});
