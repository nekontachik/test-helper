import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectDetails from '../../../pages/projects/[projectId]';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const queryClient = new QueryClient();

describe('ProjectDetails page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { projectId: 'project1' },
    });
  });

  it('renders the project details page', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProjectDetails />
      </QueryClientProvider>
    );
    expect(screen.getByText(/project details/i)).toBeInTheDocument();
  });
});
