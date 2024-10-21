import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestCaseDetails } from '@/components/TestCaseDetails';
import { apiClient } from '@/lib/apiClient';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/lib/apiClient');

const queryClient = new QueryClient();

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

describe('Edit Test Case Flow', () => {
  it('edits a test case successfully', async () => {
    (apiClient.updateTestCase as jest.Mock).mockResolvedValue({
      ...mockTestCase,
      title: 'Updated Test Case 1',
      description: 'Updated Description',
    });

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <TestCaseDetails testCase={mockTestCase} onClose={() => {}} />
        </QueryClientProvider>
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Edit'));

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Updated Test Case 1' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Updated Description' },
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Updated Test Case 1')).toBeInTheDocument();
      expect(screen.getByText('Updated Description')).toBeInTheDocument();
    });

    expect(apiClient.updateTestCase).toHaveBeenCalledWith('project1', '1', {
      title: 'Updated Test Case 1',
      description: 'Updated Description',
      expectedResult: 'Expected Result 1',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
    });
  });
});
