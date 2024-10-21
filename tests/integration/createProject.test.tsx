import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectForm from '../../components/ProjectForm';
import { apiClient } from '../../lib/apiClient';

jest.mock('../../lib/apiClient');

const queryClient = new QueryClient();

describe('Create Project Flow', () => {
  it('creates a project and displays success message', async () => {
    (apiClient.createProject as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'New Project',
      description: 'Project Description',
    });

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <ProjectForm />
        </QueryClientProvider>
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText(/project name/i), {
      target: { value: 'New Project' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Project Description' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/project created successfully/i)
      ).toBeInTheDocument();
    });

    expect(apiClient.createProject).toHaveBeenCalledWith({
      name: 'New Project',
      description: 'Project Description',
    });
  });
});
