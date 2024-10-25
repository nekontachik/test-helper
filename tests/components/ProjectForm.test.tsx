import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ProjectForm } from '@/components/ProjectForm';
import userEvent from '@testing-library/user-event';

describe('ProjectForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default data', () => {
    render(
      <ChakraProvider>
        <ProjectForm onSubmit={mockOnSubmit} />
      </ChakraProvider>
    );

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    render(
      <ChakraProvider>
        <ProjectForm onSubmit={mockOnSubmit} />
      </ChakraProvider>
    );

    await userEvent.type(screen.getByLabelText(/name/i), 'Test Project');
    await userEvent.type(screen.getByLabelText(/description/i), 'Test Description');
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test Project',
      description: 'Test Description'
    });
  });
});
