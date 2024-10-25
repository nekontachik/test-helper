import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectDetails from '@/app/projects/[projectId]/page';
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
        <ProjectDetails params={{ projectId: 'project1' }} />
      </QueryClientProvider>
    );
    expect(screen.getByText(/project details/i)).toBeInTheDocument();
  });
});
