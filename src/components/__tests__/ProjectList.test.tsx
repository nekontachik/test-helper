import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import ProjectList from '../ProjectList';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types';

// Mock the useProjects hook
jest.mock('@/hooks/useProjects');

// Mock the withAuth HOC
jest.mock('@/components/withAuth', () => ({
  withAuth: (Component: React.ComponentType) => Component,
}));

const mockProjects: Project[] = [
  { 
    id: '1', 
    name: 'Project 1', 
    description: 'Description 1', 
    status: 'ACTIVE', 
    createdAt: new Date(), 
    updatedAt: new Date(), 
    userId: 'user1' 
  },
  { 
    id: '2', 
    name: 'Project 2', 
    description: 'Description 2', 
    status: 'COMPLETED', 
    createdAt: new Date(), 
    updatedAt: new Date(), 
    userId: 'user1' 
  },
];

describe('ProjectList', () => {
  const queryClient = new QueryClient();

  const renderComponent = (role = 'USER') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={{ user: { role } } as any}>
          <ProjectList projects={mockProjects} />
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders projects correctly', () => {
    renderComponent();
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });

  it('displays project status badges', () => {
    renderComponent();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('shows create project button for ADMIN role', () => {
    renderComponent('ADMIN');
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('hides create project button for USER role', () => {
    renderComponent('USER');
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });

  it('displays project descriptions', () => {
    renderComponent();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('renders empty state when no projects', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={{ user: { role: 'USER' } } as any}>
          <ProjectList projects={[]} />
        </SessionProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });
});
