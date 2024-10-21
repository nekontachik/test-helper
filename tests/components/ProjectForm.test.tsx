import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ProjectForm } from '../../components/ProjectForm';

describe('ProjectForm', () => {
  it('renders correctly with initial data', () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <ProjectForm
          onSubmit={mockOnSubmit}
          initialData={{
            name: 'Initial Project',
            description: 'Initial Description',
          }}
        />
      </ChakraProvider>
    );

    expect(screen.getByLabelText('Name')).toHaveValue('Initial Project');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Initial Description'
    );
  });

  it('submits form data correctly', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <ProjectForm onSubmit={mockOnSubmit} />
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'New Project' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Description' },
    });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'New Description',
      });
    });
  });

  it('displays validation errors', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ChakraProvider>
        <ProjectForm onSubmit={mockOnSubmit} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with correct data', async () => {
    const mockOnSubmit = jest.fn();
    const { getByLabelText, getByText } = render(
      <ProjectForm onSubmit={mockOnSubmit} />
    );

    fireEvent.change(getByLabelText(/name/i), {
      target: { value: 'Test Project' },
    });
    fireEvent.change(getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    });

    fireEvent.click(getByText(/submit/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'Test Description',
      });
    });
  });
});
