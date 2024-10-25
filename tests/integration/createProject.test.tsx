import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectForm } from '@/components/ProjectForm';
import apiClient from '@/lib/apiClient';

jest.mock('../../lib/apiClient');

const queryClient = new QueryClient();

describe('Create Project Flow', () => {
  it('creates a project and displays success message', async () => {
    const mockCreateProject = jest.fn().mockResolvedValue({
      id: '1',
      name: 'New Project',
      description: 'Project Description',
    });

    (apiClient.createProject as jest.Mock) = mockCreateProject;

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <ProjectForm onSubmit={mockCreateProject} />
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

    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'New Project',
      description: 'Project Description',
    });
  });

  it('handles submission errors', async () => {
    const mockError = new Error('Failed to create project');
    const mockCreateProject = jest.fn().mockRejectedValue(mockError);

    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <ProjectForm onSubmit={mockCreateProject} />
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
      expect(screen.getByText(/error creating project/i)).toBeInTheDocument();
    });

    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'New Project',
      description: 'Project Description',
    });
  });
});
